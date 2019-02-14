import GlyphString from './GlyphString';

export default class LineFragment extends GlyphString {
  constructor(rect, glyphString) {
    super(glyphString.string, glyphString.glyphRuns);

    this.rect = rect;
    this.glyphString = glyphString;
    this.decorationLines = [];
    this.overflowLeft = 0;
    this.overflowRight = 0;
    this.stringStart = null;
    this.stringEnd = null;
  }

  copy() {
    const rect = this.rect.copy();
    const glyphString = this.glyphString.copy();

    const instance = new LineFragment(rect, glyphString);

    instance.decorationLines = this.decorationLines;
    instance.overflowLeft = this.overflowLeft;
    instance.overflowRight = this.overflowRight;
    instance.stringStart = this.stringStart;
    instance.stringEnd = this.stringEnd;

    return instance;
  }
}
