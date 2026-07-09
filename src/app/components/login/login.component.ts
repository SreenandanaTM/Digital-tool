import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AllApiService } from '../../service/all-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
   fb=inject(FormBuilder)
    loginForm:FormGroup
     route=inject(Router)
     api=inject(AllApiService)


     constructor(){
    this.loginForm=this.fb.group({
      username:['',[Validators.required,Validators.pattern('[a-zA-Z ]*')]],
      password:['',[Validators.required,Validators.pattern('[a-zA-Z@34578_0-9]*')]],
      role:['',Validators.required]
    })
  }

  // function for login
  login(){
    const data=this.loginForm.value
    if(this.loginForm.valid){
      this.api.loginAPI(data).subscribe({
        next:(res:any)=>{
          console.log(res);
          sessionStorage.setItem('user',JSON.stringify({
            name:this.loginForm.value.username,
            role:this.loginForm.value.role
          }))
          this.route.navigateByUrl('/landing')
          alert(res.message)
        },error:(err)=>{
          console.log(err);
          
        }
      })
    }
  }

  

}
