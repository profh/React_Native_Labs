export interface EmojiModel {
  emoji: string;
  emojiNames: string[];
}

export enum EmojiSearchStatus {
  GameOver = "GameOver",
  Searching = "Searching",
  Found = "Found",
  NotFound = "NotFound",
}

export interface CameraProps {
  emojiNames: string[];
  onEmojiFound: (status: EmojiSearchStatus) => void;
  setTensorLoaded: (loaded: boolean) => void;
}