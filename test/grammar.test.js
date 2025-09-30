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
  return printPrettyCSTML(tree);
};

describe('@bablr/language-en-cstml-json', () => {
  describe('Expression', () => {
    const json = buildJSONTag(spam`<$_Expression />`);

    it(`\`'"'\``, () => {
      expect(print(json`'"'`)).toEqual(dedent`\
        <$String>
          openToken: <* "'" { balanced: "'", balancedSpan: 'String:Single' } />
          content$: <*StringContent '"' />
          closeToken: <* "'" { balancer: true } />
        </>\n`);
    });

    it('`{foo:null}`', () => {
      expect(print(json`{foo:null}`)).toEqual(dedent`\
        <$Object>
          openToken: <* '{' { balanced: '}' } />
          properties[]$:
          <$Property>
            key$:
            <$Identifier>
              openToken: null
              content: <*IdentifierContent 'foo' { span: 'Identifier' } />
              closeToken: null
            </>
            sigilToken: <* ':' />
            value+$:
            <$Null>
              sigilToken: <*Keyword 'null' />
            </>
          </>
          closeToken: <* '}' { balancer: true } />
        </>\n`);
    });

    it('`{"foo":null}`', () => {
      expect(print(json`{"foo":null}`)).toEqual(dedent`\
        <$Object>
          openToken: <* '{' { balanced: '}' } />
          properties[]$:
          <$Property>
            key$:
            <$String>
              openToken: <* '"' { balanced: '"', balancedSpan: 'String:Double' } />
              content$: <*StringContent 'foo' />
              closeToken: <* '"' { balancer: true } />
            </>
            sigilToken: <* ':' />
            value+$:
            <$Null>
              sigilToken: <*Keyword 'null' />
            </>
          </>
          closeToken: <* '}' { balancer: true } />
        </>\n`);
    });
  });
});
