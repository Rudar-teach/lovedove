'use client';

import CharacterSvg from './CharacterSvg';
import type { CharacterProps } from './types';

/** The panda sits on the right, leans toward the bear (leanDir = -1), and
 *  follows the bear with a 0.15s motion lag so the pair never moves in
 *  lockstep. */
export default function Panda(props: CharacterProps) {
  return <CharacterSvg variant="panda" leanDir={-1} lag={0.15} {...props} />;
}
