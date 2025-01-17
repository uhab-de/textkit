import * as R from 'ramda';

import advanceWidth from '../attributedString/advanceWidth';
import trailingOffset from '../attributedString/trailingOffset';
import dropLast from '../attributedString/dropLast';

const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

/**
 * Remove new line char at the end of line if present
 *
 * @param  {Object}  line
 * @return {Object} line
 */
const removeNewLine = R.when(
  R.compose(
    R.equals('\n'),
    R.last,
    R.prop('string')
  ),
  dropLast
);

const getOverflowRight = R.converge(R.add, [R.propOr(0, 'overflowRight'), trailingOffset]);

/**
 * Ignore whitespace at the start and end of a line for alignment
 *
 * @param  {Object}  line
 * @return {Object} line
 */
const adjustOverflow = line => {
  const overflowLeft = 0;
  const overflowRight = getOverflowRight(line);

  return R.compose(
    R.assoc('overflowLeft', overflowLeft),
    R.assoc('overflowRight', overflowRight),
    R.evolve({
      box: R.evolve({
        x: R.subtract(R.__, overflowLeft),
        width: R.add(overflowLeft + overflowRight)
      })
    })
  )(line);
};

/**
 * Performs line justification by calling appropiate engine
 *
 * @param  {Object}  engines
 * @param  {Object}  layout options
 * @param  {string}  text align
 * @param  {Object}  line
 * @return {Object} line
 */
const justifyLine = (engines, options, align) => line => {
  const lineAdvanceWidth = advanceWidth(line);
  const remainingWidth = Math.max(0, line.box.width - lineAdvanceWidth);
  const shouldJustify = align === 'justify' || lineAdvanceWidth > line.box.width;

  return R.compose(
    R.when(R.always(shouldJustify), engines.justification(options)),
    R.evolve({ box: R.evolve({ x: R.add(remainingWidth * ALIGNMENT_FACTORS[align]) }) })
  )(line);
};

/**
 * Finalize line by performing line justification
 * and text decoration (using appropiate engines)
 *
 * @param  {Object}  engines
 * @param  {Object}  layout options
 * @param  {Object}  line
 * @param  {number}  line index
 * @param  {Array}  total lines
 * @return {Object} line
 */
const finalizeBlock = (engines = {}, options) => (line, i, lines) => {
  const isLastFragment = i === lines.length - 1;
  const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
  const align = isLastFragment ? style.alignLastLine : style.align;

  return R.compose(
    engines.textDecoration(options),
    justifyLine(engines, options, align),
    adjustOverflow,
    removeNewLine
  )(line);
};

/**
 * Finalize line block by performing line justification
 * and text decoration (using appropiate engines)
 *
 * @param  {Object}  engines
 * @param  {Object}  layout options
 * @param  {Array}  line blocks
 * @return {Array} line blocks
 */
const finalizeFragments = (engines, options, blocks) =>
  R.map(R.addIndex(R.map)(finalizeBlock(engines, options)), blocks);

export default R.curryN(3, finalizeFragments);
