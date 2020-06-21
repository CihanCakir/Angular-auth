import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  insertForm: FormGroup;
  Username: FormControl;
  Password: FormControl;
  returnUrl: string;
  ErrorMessage: string;
  invalidLogin: boolean;

  constructor(private accountService: AccountService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  onSubmit() {
    const userlogin = this.insertForm.value;
    this.accountService.Login(userlogin.Username, userlogin.Password).subscribe(result => {
      this.invalidLogin = false;
      this.router.navigateByUrl(this.returnUrl);
    }, error => {
      this.invalidLogin = true;
      this.ErrorMessage = "Invalid Details Supplied";
      console.log(this.ErrorMessage)
    })
  }


  ngOnInit() {

    // Initialize Form Controls
    this.Username = new FormControl('', [Validators.required]);
    this.Password = new FormControl('', [Validators.required]);

    // get retunr url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // initialize formgroup using FomBuilder
    this.insertForm = this.fb.group({
      'Username': this.Username,
      'Password': this.Password

    })
  }

}
