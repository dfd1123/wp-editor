/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */

import WpEditor, { WpEditorProps, WpEditorRef } from './components/editor/WpEditor';
import FeedDetailEditor, {
  FeedDetailEditorProps,
  FeedDetailEditorValue,
  PostEditorImageValue,
  PostEditorMediaValue
} from './components/feed/FeedDetailEditor';

import FeedBox, { FeedBoxProps } from './components/feed/FeedBox';
import FeedTextContent, { FeedTextContentProps } from './components/feed/FeedTextContent';
import FeedEmojiArea, { FeedEmojiAreaProps } from './components/feed/FeedEmojiArea';
import FeedEtcInfoArea, { FeedEtcInfoAreaProps } from './components/feed/FeedEtcInfoArea';
import FeedWriterInfo, { FeedWriterInfoProps } from './components/feed/FeedWriterInfo';
import CommentBox, { CommentBoxProps } from './components/comment/CommentBox';
import CommentEditor, { CommentEditorProps } from './components/comment/CommentEditor';
import CommentEtcInfo, { CommentEtcInfoProps } from './components/comment/CommentEtcInfo';
import CommentWriterInfo, { CommentWriterInfoProps } from './components/comment/CommentWriterInfo';

export type {
  WpEditorRef,
  WpEditorProps,
  FeedDetailEditorProps,
  PostEditorMediaValue,
  PostEditorImageValue,
  FeedDetailEditorValue,
  FeedBoxProps,
  FeedTextContentProps,
  FeedEmojiAreaProps,
  FeedEtcInfoAreaProps,
  FeedWriterInfoProps,
  CommentBoxProps,
  CommentEditorProps,
  CommentEtcInfoProps,
  CommentWriterInfoProps
};
export {
  WpEditor,
  FeedDetailEditor,
  FeedBox,
  FeedTextContent,
  FeedEmojiArea,
  FeedEtcInfoArea,
  FeedWriterInfo,
  CommentBox,
  CommentEditor,
  CommentEtcInfo,
  CommentWriterInfo
};
