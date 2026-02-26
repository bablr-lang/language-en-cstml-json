import { buildTag } from 'bablr';
import { spam } from '@bablr/boot';
import { dedent } from '@qnighy/dedent';
import language from '@bablr/language-en-cstml-json';
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
        <$_>
          _:
          <$String>
            openToken*: <* "'" />
            content$: <*StringContent '"' />
            closeToken*: <* "'" />
          </>
        </>\n`);
    });

    it('`{foo:null}`', () => {
      expect(print(json`{foo:null}`)).toEqual(dedent`\
        <$_>
          _:
          <$Object>
            openToken*: <* '{' />
            properties[]$:
            <$Property>
              key$:
              <$Identifier>
                content*: <*IdentifierContent 'foo' />
              </>
              sigilToken*: <* ':' />
              value$:
              <$Null>
                sigilToken*: <*Keyword 'null' />
              </>
            </>
            closeToken*: <* '}' />
          </>
        </>\n`);
    });

    it('`{"foo":null}`', () => {
      expect(print(json`{"foo":null}`)).toEqual(dedent`\
        <$_>
          _:
          <$Object>
            openToken*: <* '{' />
            properties[]$:
            <$Property>
              key$:
              <$String>
                openToken*: <* '"' />
                content$: <*StringContent 'foo' />
                closeToken*: <* '"' />
              </>
              sigilToken*: <* ':' />
              value$:
              <$Null>
                sigilToken*: <*Keyword 'null' />
              </>
            </>
            closeToken*: <* '}' />
          </>
        </>\n`);
    });
  });
});
