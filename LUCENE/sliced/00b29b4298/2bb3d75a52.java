/* Generated By:JavaCC: Do not edit this line. QueryParserConstants.java */
package org.apache.solr.parser;


/**
 * Token literal values and constants.
 * Generated by org.javacc.parser.OtherFilesGen#start()
 */
public interface QueryParserConstants {

  /** End of File. */
  int EOF = 0;
  /** RegularExpression Id. */
  int _NUM_CHAR = 1;
  /** RegularExpression Id. */
  int _ESCAPED_CHAR = 2;
  /** RegularExpression Id. */
  int _TERM_START_CHAR = 3;
  /** RegularExpression Id. */
  int _TERM_CHAR = 4;
  /** RegularExpression Id. */
  int _WHITESPACE = 5;
  /** RegularExpression Id. */
  int _QUOTED_CHAR = 6;
  /** RegularExpression Id. */
  int _SQUOTED_CHAR = 7;
  /** RegularExpression Id. */
  int AND = 9;
  /** RegularExpression Id. */
  int OR = 10;
  /** RegularExpression Id. */
  int NOT = 11;
  /** RegularExpression Id. */
  int PLUS = 12;
  /** RegularExpression Id. */
  int MINUS = 13;
  /** RegularExpression Id. */
  int BAREOPER = 14;
  /** RegularExpression Id. */
  int LPAREN = 15;
  /** RegularExpression Id. */
  int RPAREN = 16;
  /** RegularExpression Id. */
  int COLON = 17;
  /** RegularExpression Id. */
  int STAR = 18;
  /** RegularExpression Id. */
  int CARAT = 19;
  /** RegularExpression Id. */
  int QUOTED = 20;
  /** RegularExpression Id. */
  int SQUOTED = 21;
  /** RegularExpression Id. */
  int TERM = 22;
  /** RegularExpression Id. */
  int FUZZY_SLOP = 23;
  /** RegularExpression Id. */
  int PREFIXTERM = 24;
  /** RegularExpression Id. */
  int WILDTERM = 25;
  /** RegularExpression Id. */
  int REGEXPTERM = 26;
  /** RegularExpression Id. */
  int RANGEIN_START = 27;
  /** RegularExpression Id. */
  int RANGEEX_START = 28;
  /** RegularExpression Id. */
  int LPARAMS = 29;
  /** RegularExpression Id. */
  int NUMBER = 30;
  /** RegularExpression Id. */
  int RANGE_TO = 31;
  /** RegularExpression Id. */
  int RANGEIN_END = 32;
  /** RegularExpression Id. */
  int RANGEEX_END = 33;
  /** RegularExpression Id. */
  int RANGE_QUOTED = 34;
  /** RegularExpression Id. */
  int RANGE_GOOP = 35;

  /** Lexical state. */
  int Boost = 0;
  /** Lexical state. */
  int Range = 1;
  /** Lexical state. */
  int DEFAULT = 2;

  /** Literal token values. */
  String[] tokenImage = {
    "<EOF>",
    "<_NUM_CHAR>",
    "<_ESCAPED_CHAR>",
    "<_TERM_START_CHAR>",
    "<_TERM_CHAR>",
    "<_WHITESPACE>",
    "<_QUOTED_CHAR>",
    "<_SQUOTED_CHAR>",
    "<token of kind 8>",
    "<AND>",
    "<OR>",
    "<NOT>",
    "\"+\"",
    "\"-\"",
    "<BAREOPER>",
    "\"(\"",
    "\")\"",
    "\":\"",
    "\"*\"",
    "\"^\"",
    "<QUOTED>",
    "<SQUOTED>",
    "<TERM>",
    "<FUZZY_SLOP>",
    "<PREFIXTERM>",
    "<WILDTERM>",
    "<REGEXPTERM>",
    "\"[\"",
    "\"{\"",
    "<LPARAMS>",
    "<NUMBER>",
    "\"TO\"",
    "\"]\"",
    "\"}\"",
    "<RANGE_QUOTED>",
    "<RANGE_GOOP>",
  };

}
