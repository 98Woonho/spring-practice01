package com.whl.studybbs.factories;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

public class MailFactory {
    public final Context context = new Context();

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final MimeMessage mimeMessage;
    private final MimeMessageHelper mimeMessageHelper;

    public MailFactory(JavaMailSender mailSender, SpringTemplateEngine templateEngine) throws MessagingException {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.mimeMessage = this.mailSender.createMimeMessage();
        this.mimeMessageHelper = new MimeMessageHelper(this.mimeMessage, false);
    }

    public void send() {
        this.mailSender.send(this.mimeMessage);
    }

    public MailFactory setContextVariable(String key, Object value) {
        this.context.setVariable(key, value);
        return this;
    }

    public MailFactory setSubject(String subject) throws MessagingException {
        this.mimeMessageHelper.setSubject(subject);
        return this;
    }

    public MailFactory setTemplate(String template) throws MessagingException {
        this.mimeMessageHelper.setText(this.templateEngine.process(template, this.context), true);;
        return this;
    }

    public MailFactory setTo(String to) throws MessagingException {
        this.mimeMessageHelper.setTo(to);
        return this;
    }

    /*
    // Email로 인증번호 보내기
    Context context = new Context(); // emailAuth에 있는 데이터를 registerEmail.html로 넘기기 위한 객체 생성
        context.setVariable("emailAuth", emailAuth);
    String textHtml = this.templateEngine.process("user/resetPasswordEmail", context);
    MimeMessage message = this.mailSender.createMimeMessage();
    MimeMessageHelper messageHelper = new MimeMessageHelper(message, false);
        messageHelper.setTo(emailAuth.getEmail());
        messageHelper.setSubject("[BBS] 비밀번호 재설정 인증번호");
        messageHelper.setText(textHtml, true);
        this.mailSender.send(message);
     */
}
