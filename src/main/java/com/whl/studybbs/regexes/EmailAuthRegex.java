package com.whl.studybbs.regexes;

public enum EmailAuthRegex implements Regex{
    EMAIL(UserRegex.EMAIL.expression),
    CODE("^(\\d{6})$"),
    SALT("^([\\da-z]{128})$")
    ;

    public final String expression;

    EmailAuthRegex(String expression) {
        this.expression = expression;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.expression);
    }
}
