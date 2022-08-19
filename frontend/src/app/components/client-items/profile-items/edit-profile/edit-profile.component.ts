import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/models/client';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { FormClient } from 'src/app/models/formClient';
import { FormsModule } from '@angular/forms';
import { ClientRestService } from 'src/app/services/client-rest.service';
import { ProfileComponent } from '../profile/profile.component';
import { PersonalInformationComponent } from '../personal-information/personal-information.component';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  @Input() client!: Client;
  nif!: number;

  email = new FormControl('', [Validators.required, Validators.email]);
  zip = new FormControl('', [
    Validators.required,
    Validators.pattern('^d{4}-d{3}?$'),
  ]);

  constructor(
    private rest: ClientRestService,
    private router: Router,
    private personal: PersonalInformationComponent,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.nif = this.client.personalInformation.nif;
  }

  editProfile() {
    this.rest.editClient(this.client, this.nif).subscribe(
      (res) => {
        let local = JSON.parse(localStorage.getItem('currentUser')!);
        local.name = this.client.personalInformation.name;
        localStorage.setItem('currentUser', JSON.stringify(local));

        this.toast.success({
          detail: 'Sucesso!',
          summary: 'Perfil do utilizador editado!',
          duration: 5000,
        });
        this.personal.isEditing = false;
      },
      (err) => {
        this.toast.error({
          detail: 'Erro!',
          summary:
            'Ocorreu um erro ao editar perfil! Valores podem estar errados',
          duration: 5000,
        });
      }
    );
  }
}
