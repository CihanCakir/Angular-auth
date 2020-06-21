import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient, private router: Router) { }
  private baseUrl = environment.apiUrl;

  // User related properties ;

  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private UserName = new BehaviorSubject<string>(localStorage.getItem('username'));
  private UserRole = new BehaviorSubject<string>(localStorage.getItem('userRole'));


  register(username: string, password: string, email: string) {
    return this.http.post<any>(this.baseUrl + 'account/register', { username, password, email }).pipe(
      map(result => {
        // registration Başarıı ise
        return result;
      }, error => {
        return error;
      })
    )
  }
  Login(username: string, password: string) {
    return this.http.post<any>(this.baseUrl + 'account/login', { username, password }).pipe(
      map(result => {
        // eğer login başarılı ise jwt token response da dönecek
        if (result && result.token) {
          // user details and jwt token lokal storage de tutacağız sayfalar arası geçiş yaparken sayfa yenilendikce tutmak için
          this.loginStatus.next(true);
          localStorage.setItem('loginStatus', '1');
          localStorage.setItem('token', result.token);
          localStorage.setItem('username', result.username);
          localStorage.setItem('expiration', result.expiration);
          localStorage.setItem('userRole', result.userRole);

        }
      })
    );
  }
  Logout() {
    this.loginStatus.next(false);
    localStorage.setItem('loginStatus', '0');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userRole');
    this.router.navigate(['/home']);
    console.log('logout succesfult');
  }


  checkLoginStatus(): boolean {
    var loginCookie = localStorage.getItem('loginStatus');
    if (loginCookie === '1') {
      if (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined) {
        return false;
      }
      const token = localStorage.getItem('token');
      const decode = jwt_decode(token);
      if (decode.exp === undefined) {
        return false;
      }
      // Get Current Date Time
      const date = new Date(0);

      // concer exp time to utc
      let tokenExpDate = date.setUTCSeconds(decode.exp);

      // eğer token değeri şuan ki zamandan büyük ise

      if (tokenExpDate.valueOf() > new Date().valueOf()) {
        return true;
      }

      return false
    }
    return false;
  }

  get isLoggesIn() {
    return this.loginStatus.asObservable();
  }

  get currentUserName() {
    return this.UserName.asObservable();
  }
  get currentUserRole() {
    return this.UserRole.asObservable();
  }

}
