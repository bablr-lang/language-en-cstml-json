import { m, eat, eatMatch, match, fail, startSpan, endSpan } from '@bablr/helpers/grammar';
import { default as JSON, dependencies } from '@bablr/language-en-json';
import { printSource } from '@bablr/agast-helpers/tree';

export const canonicalURL = 'https://bablr.org/languages/core/en/cstml-json';

export const defaultMatcher = m`<_Expression />`;

export function* eatMatchTrivia() {
  let trivia = null;
  while (yield match(m`/[ \t\r\n]/`)) {
    trivia = yield eat(m`#: :Space: <_Blank />`);
  }
  return trivia;
}

export const grammar = class CSTMLJSONGrammar extends JSON.grammar {
  *Expression(props) {
    if (yield match(m`'NaN'`)) {
      yield eat(m`<NotANumber />`);
    } else if (yield match(m`'undefined'`)) {
      yield eat(m`<Undefined />`);
    } else if (yield eatMatch(m`<Infinity /[+-]?Infinity/ />`)) {
    } else {
      yield* super.Expression(props);
    }
  }

  *String() {
    let q = yield match(m`/['"]/`);

    if (!q) yield fail();

    const q_ = printSource(q);

    yield q_ === "'" ? eat(m`openToken*: <* "'" />`) : eat(m`openToken*: <* '"' />`);
    let span = q_ === "'" ? 'String:Single' : 'String:Double';
    yield startSpan(span, q_);
    yield eat(m`content$: <*StringContent />`);
    yield endSpan();
    yield q_ === "'" ? eat(m`closeToken*: <* "'" />`) : eat(m`closeToken*: <* '"' />`);
  }

  *Property() {
    if (yield match(m`/['"]/`)) {
      yield eatMatch(m`key$: <String />`);
    } else {
      yield eatMatch(m`key$: <Identifier />`);
    }

    yield* eatMatchTrivia();
    yield eat(m`sigilToken*: <* ':' />`);
    yield* eatMatchTrivia();
    yield eat(m`value$: <_Expression />`);
  }

  *Identifier() {
    yield eat(m`content*: <*IdentifierContent />`);
  }

  *IdentifierContent() {
    let lit, esc;
    do {
      if ((esc = yield match(m`'\\'`))) {
        esc = yield eatMatch(m`@: <EscapeSequence />`);
      } else {
        lit = yield eatMatch(m`/[a-zA-Z\u{80}-\u{10ffff}][a-zA-Z0-9_\u{80}-\u{10ffff}-]*/`);
      }
    } while (lit || esc);
  }

  *NotANumber() {
    yield eat(m`sigilToken*: <*Keyword 'NaN' />`);
  }

  *Undefined() {
    yield eat(m`sigilToken*: <*Keyword 'undefined' />`);
  }

  *EscapeSequence(args) {
    yield* super.EscapeSequence(args);

    let s = args.getState();

    let { cooked } = s.node.value.attributes;

    if (cooked >= '\uD800' && cooked <= '\uDFFF') {
      throw new Error('unpaired surrogates are invalid in CSTML JSON');
    }
  }

  *Infinity() {
    yield eatMatch(m`signToken*: <* /[+-]/ />`);
    yield eat(m`sigilToken*: <*Keyword 'Infinity' />`);
  }
};

export default { canonicalURL, dependencies, grammar, defaultMatcher };
