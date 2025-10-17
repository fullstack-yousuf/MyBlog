import { Controller, Get, Post as HttpPost, Param, Body, Query, Delete, Patch, UseGuards, Req, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: PostQueryDto,@Request() req) {
      const userId = req.user.id; // ✅ JWT payload user ID
    return this.postsService.findAll(query,userId );
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  findMine(@Req() req) {
    return this.postsService.findMyPosts(req.user);
  }
  
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string,@Request() req) {
     const userId = req.user.id; 
    return this.postsService.findOne(id, userId);
  }

  @HttpPost()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreatePostDto, @Req() req) {
    console.log("log the req in controller" ,req);
    
    return this.postsService.create(dto, req.user);
  }
 
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
    return this.postsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @Req() req) {
    console.log("detele the id",id);
    
    return this.postsService.delete(id, req.user);
  }

  @HttpPost(':id/like')
  @UseGuards(AuthGuard('jwt'))
  toggleLike(@Param('id') id: string, @Req() req) {
    return this.postsService.toggleLike(id, req.user);
  }

  @HttpPost(':id/comment')
  @UseGuards(AuthGuard('jwt'))
  addComment(@Param('id') id: string, @Body('text') text: string, @Req() req) {
    return this.postsService.addComment(id, text, req.user);
  }
}
// import {
//   Controller,
//   Get,
//   Post as HttpPost,
//   Param,
//   Body,
//   Patch,
//   Delete,
//   UseGuards,
//   Req,
//   Query,
// } from '@nestjs/common';
// import { PostsService } from './posts.service';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { AuthGuard } from '@nestjs/passport';

// @Controller('posts')
// export class PostsController {
//   constructor(private readonly postsService: PostsService) {}

//  @Get()
// async findAll(
//   @Query('page') page = 1,
//   @Query('limit') limit = 5,
//   @Query('sortBy') sortBy = 'createdAt',
//   @Query('order') order: 'ASC' | 'DESC' = 'DESC',
// ) {
//   return this.postsService.findAll({
//     page: +page,
//     limit: +limit,
//     sortBy,
//     order,
//   });
// }

//   @Get(':id')
//   getOne(@Param('id') id: number) {
//     return this.postsService.findOne(id);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @HttpPost()
//   create(@Body() dto: CreatePostDto, @Req() req: any) {
//     return this.postsService.create(dto, req.user.id);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Get('my')
//   getMyPosts(@Req() req: any) {
//     return this.postsService.findByUser(req.user.id);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Patch(':id')
//   update(@Param('id') id: number, @Body() dto: UpdatePostDto) {
//     return this.postsService.update(id, dto);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Delete(':id')
//   delete(@Param('id') id: number) {
//     return this.postsService.delete(id);
//   }
//}
////////////////////////////////////////
// import {
//   Controller,
//   Get,
//   Post,
//   Param,
//   Body,
//   Patch,
//   Delete,
//   UseGuards,
//   Req,
//   Query,
// } from '@nestjs/common';
// import { PostsService } from './posts.service';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { AuthGuard } from '@nestjs/passport';

// @Controller('posts')
// export class PostsController {
//   constructor(private readonly postsService: PostsService) {}

//   @Get()
//   getAll(
//      @Query('page') page = 1,
//   @Query('limit') limit = 10,
//   @Query('sortBy') sortBy: 'createdAt' | 'likes' = 'createdAt',
//   @Query('order') order: 'asc' | 'desc' = 'desc'
// )  {
//     return this.postsService.findAll({ page, limit, sortBy, order });
//   }

//   @Get(':id')   
//   getOne(@Param('id') id: number) {
//     return this.postsService.findOne(id);
//   }

// //   @UseGuards(JwtAuthGuard)
//   @UseGuards(AuthGuard('jwt'))
//   @Post()
//   create(@Body() dto: CreatePostDto, @Req() req: any) {
//     console.log("req in controller in post", req);
    
//     return this.postsService.create(dto, req.user.id);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Patch(':id')
//   update(@Param('id') id: number, @Body() dto: UpdatePostDto) {
//     return this.postsService.update(id, dto);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Delete(':id')
//   delete(@Param('id') id: number) {
//     return this.postsService.delete(id);
//   }
// }
