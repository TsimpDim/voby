export interface Tag {
    id: number;
    value: string;
    word: number[];
}

export interface Word {
    id: number;
    word: string;
    set: number[];
    set_name: string;
    translations: {id: number, value: string}[];
    examples: {text: string, translation: string, id: number}[];
    general: string;
    plural: string;
    favorite: boolean;
    related_words: any[];
    created: string
    tags: Tag[];
}

export interface UserShortcut {
    key_1: string,
    key_2: string,
    result: string,
    id: number
}

export interface RelatedWord {
    id: number;
    word: string;
}

export interface TestWord {
    word: string;
    translations: string;
    source_language: string;
    target_language: string;
}

export interface PassedDataOnWordCreate {
  setId: number,
  edit: boolean,
  vclassId: number,
  allTags: Tag[],
  suggestedWord: string
};

export interface PassedDataOnWordEdit {
  word: Word,
  edit: boolean,
  vclassId: number,
  allTags: Tag[]
};