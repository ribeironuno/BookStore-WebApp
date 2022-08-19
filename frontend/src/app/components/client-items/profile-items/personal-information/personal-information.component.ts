import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/models/client';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css'],
})
export class PersonalInformationComponent implements OnInit {
  @Input() client!: Client;

  isEditing?: boolean = false;

  constructor(private profile: ProfileComponent) {}

  ngOnInit(): void {}

  editProfile() {
    this.isEditing = true;
  }
}
