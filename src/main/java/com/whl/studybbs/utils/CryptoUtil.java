package com.whl.studybbs.utils;

import java.math.BigInteger;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class CryptoUtil {
    // 메서드 매개변수에 값을 적지 않았을 경우 기본값을 사용하게 하도록 오버로딩을 함. String input은 값을 무조건 받게 함.
    public static String hashSha512(String input) {
        return CryptoUtil.hashSha512(input, StandardCharsets.UTF_8, null);
    }

    public static String hashSha512(String input, Charset charset) {
        return CryptoUtil.hashSha512(input, charset, null);
    }

    public static String hashSha512(String input, String fallback) {
        return CryptoUtil.hashSha512(input, StandardCharsets.UTF_8, fallback);
    }


    public static String hashSha512(String input, Charset charset, String fallback) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            md.reset();
            md.update(input.getBytes(charset));

            // "%0128" 의미
            // %: 포맷 문자열에서 값의 형식을 지정할 때 시작을 나타내는 기호입니다.
            // 0: 값의 앞에 0을 채워서 출력합니다.
            // 128: 출력할 전체 필드의 너비를 나타냅니다. 이 경우, 128자리의 필드를 가지고 있으므로 0으로 채워지는 값이 최소한 128자리가 됩니다.
            // x: 16진수로 출력하라는 명령입니다. 16진수 표현은 0-9와 a-f (또는 A-F) 문자로 구성됩니다.
            return String.format("%0128x", new BigInteger(1, md.digest()));
        } catch (Exception e) {
            return fallback;
        }
    }

    // 클래스를 객체화 못하게 해야 함. 그래서 생성자를 private로 선언
    private CryptoUtil() {

    }
}
