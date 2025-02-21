import { re, spam as m } from '@bablr/boot';
import { extendLanguage, o, eat, match } from '@bablr/helpers/grammar';
import { CoveredBy, Node, InjectFrom } from '@bablr/helpers/decorators';
import * as JSON from '@bablr/language-en-json';
import * as productions from '@bablr/helpers/productions';
import { buildString } from '@bablr/helpers/builders';

export const canonicalURL = 'https://bablr.org/languages/core/en/cstml-json';

export const { dependencies, eatMatchTrivia } = JSON;

export const getCooked = (escapeNode, span, ctx) => {
  let cooked = JSON.getCooked(escapeNode, span, ctx);

  if (cooked >= '\uD800' && cooked <= '\uDFFF') {
    throw new Error('unpaired surrogates are invalid in CSTML JSON');
  }

  return cooked;
};

export const grammar = class BABLRVMInstructionGrammar extends JSON.grammar {
  *Expression(props) {
    if (yield match('NaN')) {
      yield eat(m`<NaN />`);
    } else {
      yield* super.Expression(props);
    }
  }

  @CoveredBy('Expression')
  @Node
  *NaN() {
    yield eat(m`sigilToken: <*Keyword 'NaN' />`);
  }
};
