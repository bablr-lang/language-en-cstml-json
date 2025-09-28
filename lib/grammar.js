import { spam as m, re } from '@bablr/boot';
import { o, eat, eatMatch, match, fail } from '@bablr/helpers/grammar';
import * as JSON from '@bablr/language-en-json';
import { buildString } from '@bablr/helpers/builders';
import { triviaEnhancer } from '@bablr/helpers/trivia';

export const canonicalURL = 'https://bablr.org/languages/core/en/cstml-json';

export const { dependencies } = JSON;

export const defaultMatcher = m`<_Expression />`;

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span === 'Bare',
    triviaMatcher: m`#: :Space: <_Blank /[ \n\r\t]/ />`,
  },

  class CSTMLJSONGrammar extends JSON.grammar {
    *Expression(props) {
      if (yield match('NaN')) {
        yield eat(m`<NotANumber />`);
      } else if (yield match('undefined')) {
        yield eat(m`<Undefined />`);
      } else if (yield eatMatch(m`<Infinity /[+-]?Infinity/ />`)) {
      } else {
        yield* super.Expression(props);
      }
    }

    *String({ ctx }) {
      let q = yield match(re`/['"]/`);

      if (!q) yield fail();

      const q_ = ctx.sourceTextFor(q);

      yield q_ === "'"
        ? eat(m`openToken: <* "'" { balanced: "'", balancedSpan: 'String:Single' } />`)
        : eat(m`openToken: <* '"' { balanced: '"', balancedSpan: 'String:Double' } />`);

      yield eat(m`content$: <*StringContent />`);

      yield q_ === "'"
        ? eat(m`closeToken: <* "'" { balancer: true } />`)
        : eat(m`closeToken: <* '"' { balancer: true } />`);
    }

    *Property() {
      if (yield match(re`/['"]/`)) {
        yield eatMatch(m`key$: <String />`);
      } else {
        yield eatMatch(m`key$: <Identifier />`);
      }
      yield eat(m`sigilToken: <* ':' />`);
      yield eat(m`value+$: <_Expression />`);
    }

    *Identifier({ ctx }) {
      let q;
      let pn = ctx.sourceTextFor(yield match(re`/["']/`));

      if (pn) {
        q = yield eatMatch(
          m`openToken: <* ${buildString(pn)} { balanced: ${buildString(pn)} } />`,
          null,
          o({ bind: true }),
        );
      } else {
        q = yield eat(m`openToken: null`);
      }

      yield eat(m`content: <*IdentifierContent { span: 'Identifier' } />`, o({ quoted: !!q }));
      if (q) {
        yield eat(
          m`closeToken: <* ${buildString(pn)} { balancer: true } />`,
          null,
          o({ bind: true }),
        );
      } else {
        yield eat(m`closeToken: null`);
      }
    }

    *IdentifierContent({ props: { quoted = false } }) {
      let lit, esc;
      do {
        if ((esc = yield match('\\'))) {
          esc = yield eatMatch(m`@: <EscapeSequence />`);
        } else {
          if (!quoted) {
            lit = yield eatMatch(re`/[a-zA-Z\u{80}-\u{10ffff}][a-zA-Z0-9_\u{80}-\u{10ffff}-]*/`);
          } else {
            lit = yield eatMatch(re`/[^\u0060\r\n]+/`);
          }
        }
      } while (lit || esc);
    }

    *NotANumber() {
      yield eat(m`sigilToken: <*Keyword 'NaN' />`);
    }

    *Undefined() {
      yield eat(m`sigilToken: <*Keyword 'undefined' />`);
    }

    *EscapeSequence(args) {
      yield* super.EscapeSequence(args);

      let { cooked } = args.s.node.attributes;

      if (cooked >= '\uD800' && cooked <= '\uDFFF') {
        throw new Error('unpaired surrogates are invalid in CSTML JSON');
      }
    }

    *Infinity() {
      yield eatMatch(m`signToken: <* /[+-]/ />`, null, o({ bind: true }));
      yield eat(m`sigilToken: <*Keyword 'Infinity' />`);
    }
  },
);
