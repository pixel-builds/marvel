import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-character',
  templateUrl: './create-character.component.html',
  styleUrls: ['./create-character.component.sass']
})
export class CreateCharacterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  post() {
    console.log('You Clicked, boii');
  }

}
