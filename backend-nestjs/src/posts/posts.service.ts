import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>, // ✅ Added this for full user hydration
    @Inject(forwardRef(() => WebsocketService))
    private readonly websocketService: WebsocketService,
  ) {}

  // -----------------------------------
  // 🔹 FIND ALL POSTS (with pagination)
  // -----------------------------------
  async findAll(query: PostQueryDto, currentUserId: number) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

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
      qb.addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(l.id)')
            .from('like', 'l')
            .where('l.postId = post.id'),
        'likeCountOrder',
      ).orderBy('"likeCountOrder"', order); // quotes matter for SQLite
    } else {
      qb.orderBy(`post.${sortBy}`, order);
    }

    qb.skip((page - 1) * limit).take(limit);

    const [posts, total] = await qb.getManyAndCount();

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

  // -----------------------------------
  // 🔹 FIND ONE POST (detailed view)
  // -----------------------------------
  async findOne(id: string, currentUserId: number) {
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
      likeCount: post.likes?.length ?? 0,
      commentCount: post.comments?.length ?? 0,
      likedByUser:
        post.likes?.some((like) => like.user?.id === currentUserId) ?? false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  // ✅ Helper to get post with relations for broadcasting
  async findOneWithAuthor(id: string) {
    return this.postRepo.findOne({
      where: { id },
      relations: [
        'author',
        'comments',
        'comments.author',
        'likes',
        'likes.user',
      ],
    });
  }

  // -----------------------------------
  // 🔹 CREATE POST
  // -----------------------------------
  async create(dto: CreatePostDto, user: User) {
    // ✅ Always hydrate full user to ensure author.name/email exists
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
    });
    if (!fullUser) throw new BadRequestException('Invalid user');

    // Create and save post
    const post = this.postRepo.create({ ...dto, author: fullUser });
    const savedPost = await this.postRepo.save(post);

    // ✅ Fetch with full relations for WebSocket broadcast
    const fullPost = await this.findOneWithAuthor(savedPost.id);

    // 🔥 Broadcast real-time "post created" event
    this.websocketService.broadcast('post:created', fullPost);

    return fullPost; // return hydrated post to controller
  }

  // -----------------------------------
  // 🔹 UPDATE POST
  // -----------------------------------
  async update(id: string, dto: UpdatePostDto, user: User) {
    const post = await this.postRepo.findOne({
      where: { id, author: { id: user.id } },
    });
    if (!post) throw new NotFoundException('Post not found or unauthorized');

    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  // -----------------------------------
  // 🔹 DELETE POST
  // -----------------------------------
  async delete(id: string, user: User) {
    const post = await this.postRepo.findOne({
      where: { id, author: { id: user.id } },
    });
    if (!post) throw new NotFoundException('Post not found or unauthorized');

    await this.postRepo.remove(post);
    return { success: true };
  }

  // -----------------------------------
  // 🔹 LIKE TOGGLE
  // -----------------------------------

  async toggleLike(postId: string, user: User) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['likes', 'likes.user'],
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

    // 🔁 Recount after DB change
    const likeCount = await this.likeRepo.count({
      where: { post: { id: postId } },
    });

    // 🔥 Broadcast complete, fresh info
    this.websocketService.broadcast('post:likeUpdated', {
      postId,
      userId: user.id,
      liked,
      likeCount,
    });

    return { liked, likeCount };
  }

  // -----------------------------------
  // 🔹 ADD COMMENT
  // -----------------------------------
  async addComment(postId: string, text: string, user: User) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({ text, post, author: user });
    const saved = await this.commentRepo.save(comment);

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

  // -----------------------------------
  // 🔹 FIND MY POSTS
  // -----------------------------------
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
