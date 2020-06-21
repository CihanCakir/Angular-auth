import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  loginStatus$: Observable<boolean>;
  UserName$: Observable<string>;
  constructor(private accountService: AccountService, private productService: ProductService) { }

  ngOnInit(): void {
    this.loginStatus$ = this.accountService.isLoggesIn;
    this.UserName$ = this.accountService.currentUserName;
  }
  onLogout() {
    this.productService.clearCache();
    this.accountService.Logout();
  }
}
