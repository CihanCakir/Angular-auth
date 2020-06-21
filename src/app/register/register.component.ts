import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private modalService: BsModalService
  ) { }
  // Properties
  insertForm: FormGroup;
  username: FormControl;
  password: FormControl;
  cpassword: FormControl;
  email: FormControl;
  modalRef: BsModalRef;
  invalidRegister: boolean;
  // Modal Error Message Valid
  errorList: string[];
  modalMessage: string;

  @ViewChild('template') modal: TemplateRef<any>;

  onSubmit() {
    const userDetails = this.insertForm.value;
    this.accountService.register(userDetails.username, userDetails.password, userDetails.email).subscribe(result => {
      // this.invalidRegister = true;
      // logine yönelendiyor biz login de yaptığımız gibi register de token verelim
      this.router.navigate(['/login']);
    }, error => {
      this.errorList = [];
      for (let i = 0; i < error.error.length; i++) {
        this.errorList.push(error.error.value[i]);
      }
      console.log(error)
      this.modalRef = this.modalService.show(this.modal);

    });
  }

  // Custom Validator
  MustMach(passwordControl: AbstractControl): ValidatorFn {
    // LOGİC
    return (cpasswrdControl: AbstractControl): { [Key: string]: boolean } | null => {

      // return null eğer controle boş ise
      if (!passwordControl && !cpasswrdControl) {
        return null;
      }
      // diğer controlede bir hata bulursa direk  null
      if (cpasswrdControl.hasError && !passwordControl.hasError) {
        return null;
      }
      if (passwordControl.value !== cpasswrdControl.value) {
        return { 'mustMatch': true };
      }
      else {
        return null;
      }
    };
  }


  ngOnInit(): void {
    this.username = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(3)]);
    this.password = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(3)]);
    this.cpassword = new FormControl('', [Validators.required, this.MustMach(this.password)]);
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.errorList = [];
    this.insertForm = this.fb.group(
      {
        'username': this.username,
        'password': this.password,
        'cpassword': this.cpassword,
        'email': this.email,
      }
    );
  }




}
