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
