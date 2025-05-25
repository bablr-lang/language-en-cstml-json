import { buildTag } from 'bablr';
import { spam } from '@bablr/boot';
import { dedent } from '@qnighy/dedent';
import * as language from '@bablr/language-en-cstml-json';
import { expect } from 'expect';
import { printPrettyCSTML } from '@bablr/helpers/tree';

const buildJSONTag = (matcher) => {
  return buildTag(language, matcher);
};

const print = (tree) => {
  return printPrettyCSTML(tree.node);
};

describe('@bablr/language-en-cstml-json', () => {
  describe('Expression', () => {
    const json = buildJSONTag(spam`<$__Expression />`);

    it(`\`'"'\``, () => {
      expect(print(json`'"'`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/cstml-json' }>
        <$_>
          .:
          <$String>
            openToken: <*Punctuator "'" { balanced: "'", balancedSpan: 'String:Single' } />
            content$: <*StringContent '"' />
            closeToken: <*Punctuator "'" { balancer: true } />
          </>
        </>\n`);
    });

    it('`{foo:null}`', () => {
      expect(print(json`{foo:null}`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/cstml-json' }>
        <$_>
          .:
          <$Object>
            openToken: <*Punctuator '{' { balanced: '}' } />
            separatorTokens[]: []
            properties[]$: []
            properties[]$:
            <$Property>
              key$:
              <$Identifier>
                openToken: null
                content: <*IdentifierContent 'foo' { span: 'Identifier' } />
                closeToken: null
              </>
              sigilToken: <*Punctuator ':' />
              value+$:
              <$Null>
                sigilToken: <*Keyword 'null' />
              </>
            </>
            closeToken: <*Punctuator '}' { balancer: true } />
          </>
        </>\n`);
    });

    it('`{"foo":null}`', () => {
      expect(print(json`{"foo":null}`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/cstml-json' }>
        <$_>
          .:
          <$Object>
            openToken: <*Punctuator '{' { balanced: '}' } />
            separatorTokens[]: []
            properties[]$: []
            properties[]$:
            <$Property>
              key$:
              <$String>
                openToken: <*Punctuator '"' { balanced: '"', balancedSpan: 'String:Double' } />
                content$: <*StringContent 'foo' />
                closeToken: <*Punctuator '"' { balancer: true } />
              </>
              sigilToken: <*Punctuator ':' />
              value+$:
              <$Null>
                sigilToken: <*Keyword 'null' />
              </>
            </>
            closeToken: <*Punctuator '}' { balancer: true } />
          </>
        </>\n`);
    });
  });
});
