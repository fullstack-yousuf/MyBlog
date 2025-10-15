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
    const { page = 1, limit = 5, sortBy = 'createdAt', order = 'DESC' } = query;

    const [posts, total] = await this.postRepo.findAndCount({
      relations: ['author', 'comments', 'likes', 'likes.user'], // ✅ include user in likes
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author: {
          id: p.author?.id,
          name: p.author?.name,
          email: p.author?.email,
        },
        likeCount: p.likes?.length ?? 0,
        commentCount: p.comments?.length ?? 0,
        likedByUser:
          p.likes?.some((like) => like.user?.id === currentUserId) ?? false, // ✅ safe
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // async findAll(query: PostQueryDto,currentUserId:number) {
  //   const { page, limit, sortBy, order } = query;

  //   const [posts, total] = await this.postRepo.findAndCount({
  //     relations: ['author', 'comments', 'likes'],
  //     order: { [sortBy]: order },
  //     take: limit,
  //     skip: (page - 1) * limit,
  //   });
  //   // console.log("backend the data: ",posts,total,page);

  //   return {
  //     posts: posts.map((p) => ({
  //       ...p,
  //       // likeCount: p.likes?.length ?? 0,
  //       // commentCount: p.comments?.length ?? 0,
  //       likeCount: p.likes?.length ?? 0,
  //       commentCount: p.comments?.length ?? 0,
  //       likedByUser: p.likes?.some((like) => like.user.id === currentUserId),
  //     })),
  //     total,
  //     page,
  //     pages: Math.ceil(total / limit),
  //   };
  // }

  async findOne(id: string) {
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
    return post;
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
// async toggleLike(postId: string, user: User) {
//   if (!user?.id) throw new BadRequestException('User not authenticated');

//   const post = await this.postRepo.findOne({
//     where: { id: postId },
//     relations: ['likes', 'likes.user'],
//   });
//   if (!post) throw new NotFoundException('Post not found');

//   const existing = await this.likeRepo.findOne({
//     where: { post: { id: postId }, user: { id: user.id } },
//   });

//   let liked: boolean;
//   if (existing) {
//     await this.likeRepo.remove(existing);
//     liked = false;
//   } else {
//     const newLike = this.likeRepo.create({ post, user });
//     await this.likeRepo.save(newLike);
//     liked = true;
//   }

//   const likeCount = await this.likeRepo.count({
//     where: { post: { id: postId } },
//   });

//   // ✅ Emit realtime update to all clients
//   this.websocketService.broadcast('post:likeUpdated', {
//     postId,
//     liked,
//     userId: user.id,
//     likeCount,
//   });

//   return { postId, liked, likeCount };
// }
// async addComment(postId: string, text: string, user: User) {
//   if (!text?.trim()) throw new BadRequestException('Comment cannot be empty');

//   const post = await this.postRepo.findOne({ where: { id: postId } });
//   if (!post) throw new NotFoundException('Post not found');

//   const comment = this.commentRepo.create({
//     text,
//     post,
//     author: user,
//   });

//   const saved = await this.commentRepo.save(comment);

//   // ✅ Count total comments for post
//   const commentCount = await this.commentRepo.count({
//     where: { post: { id: postId } },
//   });

//   // ✅ Emit realtime new comment event
//   this.websocketService.broadcast('post:commentAdded', {
//     postId,
//     comment: {
//       id: saved.id,
//       text: saved.text,
//       author: { id: user.id, name: user.name, email: user.email },
//       createdAt: saved.createdAt,
//     },
//     commentCount,
//   });

//   return saved;
// }

// async findMyPosts(user: User) {
//   if (!user.id) throw new BadRequestException('User not authenticated');
//   const posts = await this.postRepo.find({
//     where: { author: { id: user.id } },
//     relations: ['likes', 'comments'],
//     order: { createdAt: 'DESC' },
//   });

//   return posts.map((p) => ({
//     ...p,
//     likeCount: p.likes?.length ?? 0,
//     commentCount: p.comments?.length ?? 0,
//   }));
// }
// }
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Post } from './entities/post.entity';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { log } from 'console';

// @Injectable()
// export class PostsService {
//   constructor(
//     @InjectRepository(Post)
//     private readonly postRepo: Repository<Post>,
//   ) {}

// // posts.service.ts
// async findAll(params: { page: number; limit: number; sortBy: string; order: 'ASC' | 'DESC' }) {
//   const { page, limit, sortBy, order } = params;

//   const [posts, total] = await this.postRepo.findAndCount({
//     relations: ['author', 'comments', 'likes'],
//     order: { [sortBy]: order },
//     skip: (page - 1) * limit,
//     take: limit,
//   });
// log("the lof",posts,
//     total,
//     page);

//   return {
//     posts,
//     total,
//     page,
//     pages: Math.ceil(total / limit),
//   };
// }

//   async findOne(id: number) {
//     const post = await this.postRepo.findOne({
//       where: { id },
//       relations: ['author', 'comments', 'likes'],
//     });
//     if (!post) throw new NotFoundException(`Post #${id} not found`);
//     return post;
//   }

//   async findByUser(userId: number) {
//     return this.postRepo.find({
//       where: { author: { id: userId } },
//       relations: ['author', 'comments', 'likes'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async create(dto: CreatePostDto, userId: number) {
//     const post = this.postRepo.create({ ...dto, author: { id: userId } as any });
//     return this.postRepo.save(post);
//   }

//   async update(id: number, dto: UpdatePostDto) {
//     const post = await this.findOne(id);
//     Object.assign(post, dto);
//     return this.postRepo.save(post);
//   }

//   async delete(id: number) {
//     const result = await this.postRepo.delete(id);
//     if (result.affected === 0) throw new NotFoundException(`Post #${id} not found`);
//     return true;
//   }
// }
///////////////////////////////////////////////////
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Post } from './entities/post.entity';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';

// @Injectable()
// export class PostsService {
//   constructor(
//     @InjectRepository(Post)
//     private readonly postRepo: Repository<Post>,
//   ) {}

//  // posts.service.ts
// async findAll({
//   page = 1,
//   limit = 10,
//   sortBy = 'createdAt',
//   order = 'desc',
// }: {
//   page?: number;
//   limit?: number;
//   sortBy?: 'createdAt' | 'likes';
//   order?: 'asc' | 'desc';
// }) {
//   const skip = (page - 1) * limit;

//   const [posts, total] = await this.postRepo.findAndCount({
//     relations: ['author', 'comments', 'likes'],
//     order: { [sortBy]: order.toUpperCase() as 'ASC' | 'DESC' },
//     take: limit,
//     skip,
//   });

//   return {
//     data: posts,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }

//   async findOne(id: number) {
//     const post = await this.postRepo.findOne({
//       where: { id },
//       relations: ['author', 'comments', 'likes'],
//     });
//     if (!post) throw new NotFoundException(`Post #${id} not found`);
//     return post;
//   }

//   async create(dto: CreatePostDto, userId: number) {
//     const post = this.postRepo.create({
//       ...dto,
//       author: { id: userId } as any,
//     });
//     return this.postRepo.save(post);
//   }

//   async update(id: number, dto: UpdatePostDto) {
//     await this.postRepo.update(id, dto);
//     return this.findOne(id);
//   }

//   async delete(id: number) {
//     await this.postRepo.delete(id);
//   }
// }
