import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { User } from '../auth/entities/user.entity';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @Inject(forwardRef(() => WebsocketService))
    private readonly websocketService: WebsocketService, // ✅ Inject the socket service
  ) {}
 
 async findAll(query: PostQueryDto, currentUserId: number) {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = query;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.commentCount', 'post.comments');

    // ✅ Safe sorting logic
    if (sortBy === 'likes') {
      qb.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(l.id)', 'likeCountOrder')
          .from('like', 'l')
          .where('l.postId = post.id');
      }, 'likeCountOrder');

      qb.orderBy('likeCountOrder', order);
    } else {
      qb.orderBy(`post.${sortBy}`, order);
    }

    qb.skip((page - 1) * limit).take(limit);

    const [posts, total] = await qb.getManyAndCount();

    // ✅ Transform and shape the data cleanly
    return {
      data: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author: {
          id: p.author?.id,
          name: p.author?.name,
          email: p.author?.email,
        },
        likeCount: (p as any).likeCount ?? 0,
        commentCount: (p as any).commentCount ?? 0,
        comments: p.comments?.map((c) => ({
          id: c.id,
          text: c.text,
          createdAt: c.createdAt,
          author: {
            id: c.author?.id,
            name: c.author?.name,
          },
        })),
        likedByUser:
          p.likes?.some((like) => like.user?.id === currentUserId) ?? false,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  }



  

  async findOne(id: string,currentUserId:number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: [
        'author',
        'comments',
        'comments.author',
        'likes',
        'likes.user',
      ],
    });
    if (!post) throw new NotFoundException('Post not found');
   // 🧠 Compute extra fields safely
  const likeCount = post.likes?.length ?? 0;
  const likedByUser =
    post.likes?.some((like) => like.user?.id === currentUserId) ?? false;
  const commentCount = post.comments?.length ?? 0;

  // 🧩 Shape response — don't send password or unnecessary data
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: {
      id: post.author?.id,
      name: post.author?.name,
      email: post.author?.email,
    },
    comments: post.comments?.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      author: {
        id: c.author?.id,
        name: c.author?.name,
      },
    })),
    likeCount,
    commentCount,
    likedByUser,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
  async create(dto: CreatePostDto, user: User) {
    const post = this.postRepo.create({ ...dto, author: user });
    console.log('this is a create post log ', post);

    return this.postRepo.save(post);
  }

  async update(id: string, dto: UpdatePostDto, user: User) {
    const post = await this.postRepo.findOne({
      where: { id, author: { id: user.id } },
    });
    if (!post) throw new NotFoundException('Post not found or unauthorized');
    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async delete(id: string, user: User) {
    const post = await this.postRepo.findOne({
      where: { id, author: { id: user.id } },      
    });
    console.log("a data",post);
    
    if (!post) throw new NotFoundException('Post not found or unauthorized');
    await this.postRepo.remove(post);
    return { success: true };
  }
  async toggleLike(postId: string, user: User) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['likes'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likeRepo.findOne({
      where: { post: { id: postId }, user: { id: user.id } },
    });

    let liked = false;
    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      const like = this.likeRepo.create({ post, user });
      await this.likeRepo.save(like);
      liked = true;
    }

    // 🔥 Broadcast real-time like update
    this.websocketService.broadcast('post:likeUpdated', {
      postId,
      userId: user.id,
      liked,
      likeCount: liked ? post.likes.length + 1 : post.likes.length - 1,
    });

    return { liked };
  }

  async addComment(postId: string, text: string, user: User) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({
      text,
      post,
      author: user,
    });
    const saved = await this.commentRepo.save(comment);

    // 🔥 Broadcast real-time comment
    this.websocketService.broadcast('post:commentAdded', {
      postId,
      comment: {
        id: saved.id,
        text: saved.text,
        author: {
          id: user.id,
          name: user.name,
        },
        createdAt: saved.createdAt,
      },
    });

    return saved;
  }

  async findMyPosts(user: User) {
    const posts = await this.postRepo.find({
      where: { author: { id: user.id } },
      relations: ['likes', 'comments'],
      order: { createdAt: 'DESC' },
    });

    return posts.map((p) => ({
      ...p,
      likeCount: p.likes?.length ?? 0,
      commentCount: p.comments?.length ?? 0,
    }));
  }
}