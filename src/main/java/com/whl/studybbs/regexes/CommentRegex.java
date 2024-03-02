package com.whl.studybbs.regexes;

public enum CommentRegex implements Regex {
    CONTENT("^(?=.{1,1000}$)(\\S)(.*)(\\S)$");

    public final String expression;

    CommentRegex(String expression) {
        this.expression = expression;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.expression);
    }
}
