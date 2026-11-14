'use client';

import CharacterSvg from './CharacterSvg';
import type { CharacterProps } from './types';

/** The bear sits on the left, so it leans toward the panda (leanDir = 1). */
export default function Bear(props: CharacterProps) {
  return <CharacterSvg variant="bear" leanDir={1} {...props} />;
}
