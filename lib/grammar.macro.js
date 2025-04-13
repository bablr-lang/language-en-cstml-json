import { spam as m } from '@bablr/boot';
import { eat, match } from '@bablr/helpers/grammar';
import { CoveredBy, Node } from '@bablr/helpers/decorators';
import * as JSON from '@bablr/language-en-json';

export const type = Symbol.for('@bablr/language');

export const canonicalURL = 'https://bablr.org/languages/core/en/cstml-json';

export const { dependencies } = JSON;

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
      yield eat(m`<NotANumber />`);
    } else if (yield match('undefined')) {
      yield eat(m`<Undefined />`);
    } else {
      yield* super.Expression(props);
    }
  }

  @CoveredBy('Expression')
  @Node
  *NotANumber() {
    yield eat(m`sigilToken: <*Keyword 'NaN' />`);
  }

  @CoveredBy('Expression')
  @Node
  *Undefined() {
    yield eat(m`sigilToken: <*Keyword 'undefined' />`);
  }
};
