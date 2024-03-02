package com.whl.studybbs.regexes;

public enum UserRegex implements Regex {
    // 열거형으로 나열된 인자들은 UserRegex의 객체라고 생각하면 됨.
    // public static final UserRegex EMAIL = new UserRegex("...");
    // 그래서 UserRegex.EMAIL.matches() 이런식으로 사용 가능함.
    EMAIL("^(?=.{4,50}$)([\\da-z_\\-.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15}\\.)?([a-z]{2,3})$"),
    PASSWORD("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]}\\\\|;:'\",<.>/?]{4,50})$"),
    NICKNAME("^([\\da-zA-Z가-힣]{2,10})$"),
    NAME("^([가-힣]{2,5})$"),
    CONTACT_FIRST("^(010)$"),
    CONTACT_SECOND("^([\\d]{3,4})$"),
    CONTACT_THIRD("^([\\d]{4})$"), // alt + enter -> inject -> regexp로 해줘야 정규표현식으로 받아들임.
    ADDRESS_POSTAL("^(\\d{5})$"),
    ADDRESS_PRIMARY("^(?=.{5,100}$)([\\d가-힣])([\\d가-힣~()\\-;:'\",. ]*)([\\d가-힣])$"),
    ADDRESS_SECONDARY("^(?=.{0,100}$)([\\da-zA-Z가-힣~()\\-;:'\",. ]*)$")
    ;
    ; // 세미콜론 좌측(인자), 우측(멤버)
    public final String expression;

    UserRegex(String expression) {
        this.expression = expression;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.expression);
    }
}
