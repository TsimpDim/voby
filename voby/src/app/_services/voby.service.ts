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
    return this.http.get(environment.apiUrl + '/voby/classes/', {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  getClass(id: number) {
    return this.http.get(environment.apiUrl + '/voby/classes/' + id, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  deleteClass(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/classes/' + index, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  createClass(name: string, sourceLanguage: string, targetLanguage: string) {
    return this.http.post(environment.apiUrl + '/voby/classes/',
      {
        name: name,
        source_language: sourceLanguage,
        target_language: targetLanguage
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  updateClass(classId: number, name: string, sourceLanguage: string, targetLanguage: string) {
    return this.http.patch(environment.apiUrl + '/voby/classes/' + classId + '/',
      {
        name: name,
        source_language: sourceLanguage,
        target_language: targetLanguage
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  createExample(wordId: number, text: string, translation: string) {
    return this.http.post(environment.apiUrl + '/voby/examples/',
      {
        word: [wordId],
        text: text,
        translation: translation
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  updateExample(exampleId: number, text: string, translation: string) {
    return this.http.patch(environment.apiUrl + '/voby/examples/' + exampleId + '/',
      {
        text: text,
        translation: translation
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  deleteExample(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/examples/' + index, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  createWord(setId: number, word: string, translation: string, plural: string, general: string, relatedWordIds: number[]) {
    return this.http.post(environment.apiUrl + '/voby/words/',
      {
        word: word,
        translation: translation,
        plural: plural || null,
        general: general,
        set: setId,
        related_words: relatedWordIds
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  editWord(wordId: number, word: string, translation: string, plural: string, general: string, relatedWordIds: number[]) {
    return this.http.patch(environment.apiUrl + '/voby/words/' + wordId + '/',
      {
        word: word,
        translation: translation,
        plural: plural || null,
        general: general,
        related_words: relatedWordIds
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  editWordFavorite(wordId: number, favorite: boolean) {
    return this.http.patch(environment.apiUrl + '/voby/words/' + wordId + '/',
      {
        favorite: favorite
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  deleteWord(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/words/' + index, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  getAllWordsOfClass(classId: number) {
    return this.http.get(environment.apiUrl + '/voby/classes/' + classId + '/all', {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }

  createSet(classIdx: number, name: string) {
    return this.http.post(environment.apiUrl + '/voby/sets/',
      {
        vclass: classIdx,
        name: name
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  updateSet(setId: number, name: string) {
    return this.http.patch(environment.apiUrl + '/voby/sets/' + setId + '/',
      {
        name: name
      },
      { headers: {"Authorization": "Token " + this.authService.getSessionToken()}});
  }

  getSet(id: number, sort: string) {
    return this.http.get(environment.apiUrl + '/voby/sets/' + id + '/', {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} ,
      params: {'sort': sort}
    });
  }

  deleteSet(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/sets/' + index, {
      headers: {"Authorization": "Token " + this.authService.getSessionToken()} 
    });
  }
}
