import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';
import {Character} from '../../models/character';
import {BlogService} from '../../services/blog.service';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.sass']
})
export class CharacterDetailsComponent implements OnInit, OnDestroy {
characterId: string;
character: Character;
isAdmin: boolean;
user: User;

characterSub: Subscription;
userSub: Subscription;
  constructor(
    private authService: AuthService,
    private router: Router,
    private characterService: CharacterService,
    private activatedRoute: ActivatedRoute,
    private blogService: BlogService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.characterId = params.id;
      this.characterSub = this.characterService.getCharacter(params.id).subscribe(character => {
          this.character = character;
      });
    });

    this.userSub = this.authService.user$.subscribe(user => {
      this.user = user;
      this.isAdmin = this.authService.canWrite(this.user);
    });
  }


  ngOnInit() {
    this.blogService.getBlogs(this.characterId).subscribe(blogs => {
      console.log(blogs);
    });
  }
  blogs() {
    this.router.navigateByUrl('/character/' + this.characterId + '/blogs');
  }
  ngOnDestroy() {
    this.characterSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
