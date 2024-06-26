import React from 'react';
import type { WpEditorPlugin } from '@/index';
import { uniqueId } from 'lodash-es';
import type { ChangeEvent, MouseEvent, KeyboardEvent, MutableRefObject } from 'react';
import HashList, { HashListRef } from './components/HashList';
import HashContainer from './components/HashContainer';

type HashTagConfig = {
  list: (Record<string, string> & { name: string })[];
  listElement?: <T = { name: string }>(item: T) => React.JSX.Element;
  onWriteHash?: (text: string) => void;
  onCompleteHash?: <T = { name: string }>(hash: T) => void;
  onCloseHashList?: () => void;
};

class HashTag implements WpEditorPlugin {
  public readonly commandKey = 'hash';
  private _hashId: string;
  private setTargetHashId: (targetHashId: string) => void;
  public contentEditableEl: MutableRefObject<HTMLDivElement>;
  private postHashListRef: HashListRef;
  private _config: HashTagConfig = {
    list: [],
    onWriteHash: (text) => {}
  };
  private setNewConfig: (newConfig: HashTagConfig) => void;

  constructor({ contentEditableEl }: { contentEditableEl: MutableRefObject<HTMLDivElement> }) {
    this.contentEditableEl = contentEditableEl;
  }

  set hashId(id: string) {
    this._hashId = id;
    this.setTargetHashId && this.setTargetHashId(this._hashId);

    if (!id) {
      this.config.onCloseHashList && this.config.onCloseHashList();
    }
  }

  get hashId() {
    return this._hashId;
  }

  set config(newConfig: HashTagConfig) {
    this._config = newConfig;
    this.setNewConfig && this.setNewConfig(newConfig);
  }

  get config() {
    return this._config;
  }

  setConfig(config: HashTagConfig) {
    this.config = { ...this.config, ...(config ?? {}) };
  }

  component({ plugin }: { plugin: HashTag }) {
    return (
      <HashContainer hash={plugin}>
        {({ list, listElement }) => (
          <HashList
            ref={(ref) => {
              this.postHashListRef = ref;
            }}
            list={list}
            listElement={listElement}
            selectHashItem={() => {
              plugin.selectHashItem();
            }}
            closeHashList={() => {
              this.hashId = '';
            }}
          />
        )}
      </HashContainer>
    );
  }

  restoreSelection({
    selection,
    range,
    focusNode,
    focusOffset,
    focusTopEnd
  }: {
    selection: Selection;
    range: Range;
    focusNode: Node;
    focusOffset?: number;
    focusTopEnd?: boolean;
  }) {
    if (focusTopEnd) {
      range.selectNodeContents(focusNode);
      range.collapse(false);
    } else {
      range.setStart(focusNode, focusOffset ?? 0);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  leaveHashTag({
    selection,
    range,
    hash
  }: {
    selection: Selection;
    range: Range;
    hash?: Record<string, string> & { name: string };
  }) {
    const target = this.contentEditableEl.current;
    const targetHashId = this.hashId;

    const hashTag = target.querySelector(`#${targetHashId}`);
    const existOnlyAtMark = hashTag.firstChild?.textContent === '#' && !hash;

    const isWillHash = !!hashTag?.classList.contains('will-hash');

    const hashRegex = new RegExp(
      `<span\\s+id="${targetHashId}"([^>]*)class="hash ${isWillHash ? 'will-hash' : 'unkown-hash'}"([^>]*)>(.*?)<\\/span>`,
      'g'
    );

    if (existOnlyAtMark) {
      target.innerHTML = target.innerHTML.replace(hashRegex, `#`);
    } else if (hash) {
      target.innerHTML = target.innerHTML.replace(
        hashRegex,
        `<span id="${targetHashId}" class="hash complete-hash"$1$2>#${hash.name}</span>&nbsp;`
      );

      const newHashTag = target.querySelector(`#${targetHashId}`) as HTMLSpanElement;

      Object.entries(hash).forEach(([key, value]) => {
        newHashTag.dataset[key] = value;
      });
    } else {
      target.innerHTML = target.innerHTML.replace(
        hashRegex,
        `<span id="${targetHashId}" class="hash unkown-hash"$1$2>${selection.focusNode.textContent}</span>&nbsp;`
      );
    }

    this.hashId = '';

    this.restoreSelection({
      selection,
      range,
      focusNode: existOnlyAtMark ? target : target.querySelector(`#${targetHashId}`)?.nextSibling,
      focusOffset: 1,
      focusTopEnd: existOnlyAtMark
    });
  }

  selectHashItem() {
    const range = document.createRange();
    const selection = window.getSelection();

    const hash = this.postHashListRef.handleSubmit();
    this.leaveHashTag({ selection, range, hash });
    this.config.onCompleteHash && this.config.onCompleteHash(hash);
  }

  handleClick({
    event,
    selection,
    range
  }: {
    selection: Selection;
    range: Range;
    event: MouseEvent<HTMLDivElement>;
  }) {
    const focusNode = selection.focusNode;

    const focusInDecompleteHashTag =
      !!focusNode?.parentElement?.classList?.contains?.('will-hash') ||
      !!focusNode?.parentElement?.classList?.contains?.('unkown-hash');

    const collapseCheckRange = selection.getRangeAt(0);

    if (
      focusInDecompleteHashTag &&
      collapseCheckRange.startOffset === collapseCheckRange.endOffset
    ) {
      this.hashId = focusNode.parentElement.id;
    }
  }

  handleKeyDown({
    event,
    selection,
    range
  }: {
    selection: Selection;
    range: Range;
    event: KeyboardEvent<HTMLDivElement>;
  }) {
    const targetHashId = this.hashId;

    const focusInDecompleteHashTag =
      !!selection.focusNode?.parentElement?.classList?.contains?.('will-hash') ||
      !!selection.focusNode?.parentElement?.classList?.contains?.('unkown-hash');

    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      if (!targetHashId && focusInDecompleteHashTag) {
        this.hashId = selection.focusNode.parentElement.id;
      } else if (targetHashId && selection.focusNode.firstChild?.textContent === '#') {
        this.leaveHashTag({ selection, range });
      } else if (targetHashId && !focusInDecompleteHashTag) {
        this.hashId = '';
      }
    }

    if (event.code === 'Space' || event.code === 'ArrowRight') {
      if (
        targetHashId &&
        focusInDecompleteHashTag &&
        !selection.focusNode.parentElement.nextElementSibling
      ) {
        event.preventDefault();

        this.leaveHashTag({ selection, range });
      } else if (targetHashId && selection.focusNode.firstChild?.textContent === '#') {
        this.leaveHashTag({ selection, range });
      }
    } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      if (targetHashId) {
        event.preventDefault();

        if (event.code === 'ArrowUp') {
          this.postHashListRef.handleArrowUp();
        } else {
          this.postHashListRef.handleArrowDown();
        }
      }
    } else if (event.code === 'Enter') {
      if (targetHashId && !event.nativeEvent.isComposing) {
        event.preventDefault();

        this.selectHashItem();
      }
    }
  }

  handleChange({
    event,
    selection,
    range
  }: {
    selection: Selection;
    range: Range;
    event: ChangeEvent<HTMLDivElement>;
  }) {
    const target = this.contentEditableEl.current;

    const focusNode = selection.focusNode;
    const focusOffset = selection.focusOffset;

    const currentInputChar = focusNode.textContent[focusOffset - 1];
    const prevCurrentInputChar = focusNode.textContent[focusOffset - 2];
    const focusInHashTag = !!focusNode?.parentElement?.classList?.contains?.('hash');
    const focusInCompleteHashTag =
      !!focusNode?.parentElement?.classList?.contains?.('complete-hash');

    const isStartHash =
      !prevCurrentInputChar?.trim() && !focusInHashTag && currentInputChar === '#';

    if (this.hashId && focusInHashTag) {
      this.config.onWriteHash &&
        this.config.onWriteHash(focusNode.parentElement.firstChild.textContent.replace('#', ''));
    }

    if (isStartHash) {
      this.hashId = `hash-${uniqueId()}`;

      // 방금 입력된 # 문자를 <span>으로 교체
      const textContent = focusNode.textContent;
      const beforeText = textContent.slice(0, focusOffset - 1);
      const afterText = textContent.slice(focusOffset);

      // 새로운 span 요소 생성
      const span = document.createElement('span');
      span.id = this.hashId;
      span.className = 'hash will-hash';
      span.textContent = '#';

      // 기존 텍스트 노드 업데이트
      focusNode.textContent = beforeText;

      // span 요소 삽입
      const parentNode = focusNode.parentNode;
      parentNode.insertBefore(span, focusNode.nextSibling);

      // 남은 텍스트 노드 삽입
      const afterTextNode = document.createTextNode(afterText);
      parentNode.insertBefore(afterTextNode, span.nextSibling);

      this.restoreSelection({
        selection,
        range,
        focusNode: target.querySelector(`#${this.hashId}`),
        focusOffset: 1
      });
    } else if (focusInCompleteHashTag) {
      focusNode.parentElement.classList.replace('complete-hash', 'will-hash');

      // dataset의 모든 속성 삭제
      for (const key in focusNode.parentElement.dataset) {
        delete focusNode.parentElement.dataset[key];
      }

      this.hashId = focusNode.parentElement.id;

      this.restoreSelection({ selection, range, focusNode: focusNode, focusOffset });
    }

    if (!isStartHash && !focusInHashTag) {
      this.hashId = '';
    }
  }

  handleUndoRedo({ selection, range }: { selection: Selection; range: Range }) {
    if ((range.startContainer as HTMLElement).classList?.contains('hash')) {
      const hashTag = range.startContainer as HTMLElement;
      const hashId = hashTag.id;

      if (!this.hashId && hashTag.children[0]) {
        const hashTagItems = hashTag.children[0].querySelectorAll('li');
        const hashList = Array.from(hashTagItems).map((item) => {
          return item.dataset as Record<string, string> & { name: string };
        });

        this.setConfig({ ...this.config, list: hashList });

        hashTag.children[0].remove();

        this.hashId = hashId;
      }
    } else {
      this.hashId = '';
    }
  }

  observe({
    setTargetHashId,
    setConfig
  }: {
    setTargetHashId: (targetHashId: string) => void;
    setConfig: (newConfig: HashTagConfig) => void;
  }) {
    this.setTargetHashId = setTargetHashId;
    this.setNewConfig = setConfig;
  }
}

export type { HashTagConfig };
export default HashTag;
