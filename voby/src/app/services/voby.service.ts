import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Tag } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class VobyService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getClasses() {
    return this.http.get(environment.apiUrl + '/voby/classes/', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  getClass(id: number) {
    return this.http.get(environment.apiUrl + '/voby/classes/' + id, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  deleteClass(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/classes/' + index, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  createClass(name: string, sourceLanguage: string, targetLanguage: string) {
    return this.http.post(
      environment.apiUrl + '/voby/classes/',
      {
        name: name,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  updateClass(
    classId: number,
    name: string,
    sourceLanguage: string,
    targetLanguage: string,
  ) {
    return this.http.patch(
      environment.apiUrl + '/voby/classes/' + classId + '/',
      {
        name: name,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  createExample(wordId: number, text: string, translation: string) {
    return this.http.post(
      environment.apiUrl + '/voby/examples/',
      {
        word: [wordId],
        text: text,
        translation: translation,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  updateExample(exampleId: number, text: string, translation: string) {
    return this.http.patch(
      environment.apiUrl + '/voby/examples/' + exampleId + '/',
      {
        text: text,
        translation: translation,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  deleteExample(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/examples/' + index, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  createWord(
    setIds: number[],
    word: string,
    plural: string,
    general: string,
    relatedWordIds: number[],
  ) {
    return this.http.post(
      environment.apiUrl + '/voby/words/',
      {
        word: word,
        plural: plural || null,
        general: general,
        sets: setIds,
        related_words: relatedWordIds,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  editSets(newSetIds: number[], wordId: number) {
    return this.http.patch(
      environment.apiUrl + '/voby/words/' + wordId + '/',
      {
        sets: newSetIds,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  editWord(
    wordId: number,
    word: string,
    plural: string,
    general: string,
    relatedWordIds: number[],
  ) {
    return this.http.patch(
      environment.apiUrl + '/voby/words/' + wordId + '/',
      {
        word: word,
        plural: plural || null,
        general: general,
        related_words: relatedWordIds,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  editWordFavorite(wordId: number, favorite: boolean) {
    return this.http.patch(
      environment.apiUrl + '/voby/words/' + wordId + '/',
      {
        favorite: favorite,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  deleteWord(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/words/' + index, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  getWord(wordId: number) {
    return this.http.get(environment.apiUrl + '/voby/words/' + wordId, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  getWords(
    classId: number,
    setId: number | undefined = undefined,
    wordSearchTerm: string | undefined = undefined,
    tags: Tag[] | undefined = undefined,
    favorite = false,
    page = 1,
    page_size = 50,
    related = false,
  ) {
    const sort = localStorage.getItem('sort') || '-created';
    const searchParams: any = {
      sets__vclass: classId,
      sort,
      page,
      page_size,
      ordering: sort,
      related,
    };
    if (wordSearchTerm && wordSearchTerm.length > 0) {
      wordSearchTerm.replace(/[\W\d]/g, ''); // Remove numbers
      searchParams.word__icontains = wordSearchTerm;
    }

    if (tags && tags.length > 0) {
      searchParams.tags__id = tags.map((t) => t.id).join(',');
    }

    if (favorite) {
      searchParams.favorite = true;
    }

    if (setId) {
      searchParams.sets = setId;
    }

    return this.http.get(environment.apiUrl + '/voby/words/', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
      params: searchParams,
    });
  }

  createSet(classIdx: number, name: string) {
    return this.http.post(
      environment.apiUrl + '/voby/sets/',
      {
        vclass: classIdx,
        name: name,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  updateSet(setId: number, name: string) {
    return this.http.patch(
      environment.apiUrl + '/voby/sets/' + setId + '/',
      {
        name: name,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  getSet(id: number) {
    return this.http.get(environment.apiUrl + '/voby/sets/' + id + '/', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  getSetWords(id: number, sort: string) {
    return this.http.get(environment.apiUrl + '/voby/sets/' + id + '/words/', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
      params: { sort: sort },
    });
  }

  deleteSet(index: number) {
    return this.http.delete(environment.apiUrl + '/voby/sets/' + index, {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  getTestWords(
    amount = 1,
    classId = -1,
    setId = -1,
    favoritesOnly = false,
  ) {
    return this.http.get(environment.apiUrl + '/voby/test', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
      params: { amount, classId, setId, favoritesOnly },
    });
  }

  getGermanNounTestWords(
    amount = 1,
    classId = -1,
    setId = -1,
    favoritesOnly = false,
  ) {
    return this.http.get(environment.apiUrl + '/voby/german/noun-test', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
      params: { amount, classId, setId, favoritesOnly },
    });
  }

  createQuizAnswer(correct: boolean) {
    return this.http.post(
      environment.apiUrl + '/voby/quizanswer/',
      {
        correct: correct,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  createTestAttempt(questionsCorrect: number) {
    return this.http.post(
      environment.apiUrl + '/voby/testattempt/',
      {
        questions_correct: questionsCorrect,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  getProfile() {
    return this.http.get(environment.apiUrl + '/voby/profile', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  createUserShortcut(key_1: string, key_2: string, result: string) {
    return this.http.post(
      environment.apiUrl + '/voby/usershortcuts/',
      { key_1, key_2, result },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  updateUserShortcut(
    userShortcutId: number,
    key_1: string,
    key_2: string,
    result: string,
  ) {
    return this.http.patch(
      environment.apiUrl + '/voby/usershortcuts/' + userShortcutId + '/',
      { key_1, key_2, result },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  getUserShortcuts() {
    return this.http.get(environment.apiUrl + '/voby/usershortcuts/', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  deleteUserShortcut(index: number) {
    return this.http.delete(
      environment.apiUrl + '/voby/usershortcuts/' + index,
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  downloadClassReport(classId: number) {
    return this.http.get(
      environment.apiUrl + '/voby/class/' + classId + '/download',
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
        responseType: 'blob',
      },
    );
  }

  createTranslation(wordId: number, value: string) {
    return this.http.post(
      environment.apiUrl + '/voby/translations/',
      {
        word: wordId,
        value: value,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  deleteTranslation(index: number) {
    return this.http.delete(
      environment.apiUrl + '/voby/translations/' + index,
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  getOptions() {
    return this.http.get(environment.apiUrl + '/voby/options', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  updateOptions(numTestQ: string) {
    return this.http.patch(
      environment.apiUrl + '/voby/options',
      {
        options: {
          numTestQuestions: numTestQ,
        },
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  getTags() {
    return this.http.get(environment.apiUrl + '/voby/tags', {
      headers: { Authorization: 'Token ' + this.authService.getSessionToken() },
    });
  }

  createTag(word: number, value: string) {
    return this.http.post(
      environment.apiUrl + '/voby/tags/',
      {
        word: [word],
        value: value,
      },
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  removeWordFromTag(tagId: number, wordId: number) {
    return this.http.put(
      `${environment.apiUrl}/voby/tags/${tagId}/remove/${wordId}/`,
      {},
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }

  addWordToTag(tagId: number, wordId: number) {
    return this.http.put(
      `${environment.apiUrl}/voby/tags/${tagId}/add/${wordId}/`,
      {},
      {
        headers: {
          Authorization: 'Token ' + this.authService.getSessionToken(),
        },
      },
    );
  }
}
