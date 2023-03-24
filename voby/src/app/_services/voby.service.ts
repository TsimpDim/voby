import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VobyService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getClasses() {
    return this.http.get(environment.apiUrl + '/voby/class/', {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  getClass(id: number) {
    return this.http.get(environment.apiUrl + '/voby/class/' + id, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  deleteClass(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/class/' + index, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  createClasses(className: string, sourceLanguage: string, targetLanguage: string) {
    return this.http.post(environment.apiUrl + '/voby/class/',
      {
        'name': className,
        'source_language': sourceLanguage,
        'target_language': targetLanguage
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  createWord(setId: number, word: string, translation: string, general: string) {
    return this.http.post(environment.apiUrl + '/voby/words/',
      {
        word: word,
        translation: translation,
        general: general,
        set: setId
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  createSet(classIdx: number, name: string) {
    return this.http.post(environment.apiUrl + '/voby/set/',
      {
        vclass: classIdx,
        name: name
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  getSet(id: number) {
    return this.http.get(environment.apiUrl + '/voby/set/' + id, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }
}
