import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User } from '../models/user';

@Injectable()


export class AuthService {

user$: Observable<User>;
mailNotFound: boolean;
wrongPassword: boolean;
networkProblem: boolean;
emailExists: boolean;

  constructor(private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private router: Router) {
    this.mailNotFound = false;
    this.wrongPassword = false;
    this.networkProblem = false;
    this.emailExists = false;
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  signUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(data => {
        return this.setDoc(data.user);
      })
      .catch(async error => {
        const code = await error.code;
        if (code === 'auth/email-already-in-use') {
          return this.emailExists = true;
        } else {
          if (code === 'auth/network-request-failed') {
            return this.networkProblem = true;
          }
        }
      });
  }

  signIn(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this.router.navigateByUrl('/');
      })
      .catch(async error => {

        const code = await error.code;
        if (code === 'auth/wrong-password') {
           this.wrongPassword = true;
        }
        if (code === 'auth/network-request-failed') {
            this.networkProblem = true;
        }
        if (code === 'auth/user-not-found') {
          this.mailNotFound = true;
        }

      });
  }

  async updateUser(user: User, data: any) {
    return this.afs.doc(`users/${user.uid}`).update(data).then(() => {
        this.router.navigateByUrl('/profile');
      }).catch(err => {
      console.log('Display Name Not Set...😶😶😶', err);
    });
  }


  signOut() {
    this.afAuth.auth.signOut().then(() => {
      console.log('Signed Out');
    });
  }

  private setDoc(user) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        user: true,
        admin: false  // ⚡❗
      },
    };
    return userRef.set(data, { merge: true });
  }

  canWrite(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }

// determines if user has matching role
  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) { return false; }
    for (const role of allowedRoles) {
      if ( user.roles[role] ) {
        return true;
      }
    }
    return false;
  }

}
