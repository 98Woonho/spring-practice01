package com.whl.studybbs.services;

import com.whl.studybbs.entities.ContactCompanyEntity;
import com.whl.studybbs.entities.EmailAuthEntity;
import com.whl.studybbs.entities.UserEntity;
import com.whl.studybbs.factories.MailFactory;
import com.whl.studybbs.mappers.UserMapper;
import com.whl.studybbs.regexes.EmailAuthRegex;
import com.whl.studybbs.regexes.UserRegex;
import com.whl.studybbs.results.user.*;
import com.whl.studybbs.utils.CryptoUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpSession;
import java.util.Date;

@Service
public class UserService {
    private static void randomize(EmailAuthEntity emailAuth) {
        UserService.randomize(emailAuth, 5);
    }

    private static void randomize(EmailAuthEntity emailAuth, int expDuration) {
        emailAuth.setCode(RandomStringUtils.randomNumeric(6));
        emailAuth.setSalt(CryptoUtil.hashSha512(String.format("%s%s%f%f",
                emailAuth.getEmail(),
                emailAuth.getCode(),
                Math.random(),
                Math.random())));
        emailAuth.setVerified(false);
        emailAuth.setCreatedAt(new Date());
        emailAuth.setExpiresAt(DateUtils.addMinutes(emailAuth.getCreatedAt(), expDuration));
    }

    private static ContactCompanyEntity[] contactCompanies;

    private final UserMapper userMapper;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Autowired // 의존성 주입
    public UserService(UserMapper userMapper, JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.userMapper = userMapper;
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public ContactCompanyEntity[] getContactCompanies() {
        if (UserService.contactCompanies == null) { // null일 때(최초로 페이지에 왔을 때) DB에서 통신사 목록 끌고옴. 그 이후 페이지 방문할 때는 DB에서 안 끌고 와도 됨.
            UserService.contactCompanies = this.userMapper.selectContactCompanies();
        }
        return UserService.contactCompanies;
    }

    public SendRegisterEmailResult sendRegisterEmail(EmailAuthEntity emailAuth) throws MessagingException {
        if (!UserRegex.EMAIL.matches(emailAuth.getEmail())) {
            return SendRegisterEmailResult.FAILURE;
        }
        if (this.userMapper.selectUserByEmail(emailAuth.getEmail()) != null) {
            return SendRegisterEmailResult.FAILURE_DUPLICATE_EMAIL;
        }

        /*
        emailAuth.setCreatedAt(new Date()); // 이메일이 보내졌을 때의 시간
        emailAuth.setExpiresAt(DateUtils.addMinutes(emailAuth.getCreatedAt(), 5)); // 이메일을 보내고 난 뒤 5분 후의 시간
        emailAuth.setVerified(false);

        // 이메일에 보낼 코드 생성
        String code = RandomStringUtils.randomNumeric(6); // 숫자로만 이루어진 6자 생성. 앞에 0이 와도 사라지지 않고 알아서 맞춰줌.
        emailAuth.setCode(code);

        // 비밀키 2개(code(6자리), salt(128)) 존재 -> DB에 insert -> 클라이언트(브라우저, 이메일) 존재 -> code => 이메일 | salt => 브라우저 보냄. -> 클라이언트가 '인증번호 확인' 버튼을 누르면 XHR로 email, code, salt 세 개의 값이 보내져서 DB에서 세 데이터를 비교해야 함.
        // salt가 있어야 하는 이유? 이메일 해킹 후 코드 해킹 당해도 salt를 몰라서 해킹 못 함.
        String salt = CryptoUtil.hashSha512(String.format("%s%s%f%f",
                emailAuth.getEmail(),
                code,
                Math.random(),
                Math.random()));
        emailAuth.setSalt(salt);
        */

        // 위 코드 메서드로 구현
        UserService.randomize(emailAuth);


        /*
        // Email로 인증번호 보내기
        Context context = new Context(); // emailAuth에 있는 데이터를 registerEmail.html로 넘기기 위한 객체 생성
        context.setVariable("emailAuth", emailAuth);
        String textHtml = this.templateEngine.process("user/registerEmail.html", context);
        MimeMessage message = this.mailSender.createMimeMessage();
        MimeMessageHelper mimemessageHelper = new MimeMessageHelper(message, false);
        mimemessageHelper.setTo(emailAuth.getEmail());
        mimemessageHelper.setSubject("[BBS] 회원가입 인증번호");
        mimemessageHelper.setText(textHtml, true);
        this.mailSender.send(message);
         */

        // 위 코드 factory로 구현

        // this.mimeMessage = this.mailSender.createMimeMessage();
        // this.mimeMessageHelper = new MimeMessageHelper(this.mimeMessage, false);
        // 생성자 호출하면서 위 객체들이 생성됨.
        new MailFactory(this.mailSender, this.templateEngine)
                // 메서드의 return을 this로 해서 메서드에서 메서드 호출이 가능함.

                // context.setVariable("emailAuth", emailAuth);
                .setContextVariable("emailAuth", emailAuth)

                // String textHtml = this.templateEngine.process("user/registerEmail.html", context);
                // messageHelper.setText(textHtml, true);
                .setTemplate("user/registerEmail")

                // mimemessageHelper.setTo(emailAuth.getEmail());
                .setTo(emailAuth.getEmail())

                // mimemessageHelper.setSubject("[BBS] 회원가입 인증번호");
                .setSubject("[BBS] 회원가입 인증번호")

                // this.mailSender.send(message);
                .send();

        return this.userMapper.insertEmailAuth(emailAuth) == 0 ? SendRegisterEmailResult.FAILURE : SendRegisterEmailResult.SUCCESS;
    }

    public VerifyRegisterEmailResult verifyRegisterEmail(EmailAuthEntity emailAuth) {
        if (!EmailAuthRegex.EMAIL.matches(emailAuth.getEmail()) ||
                !EmailAuthRegex.CODE.matches(emailAuth.getCode()) ||
                !EmailAuthRegex.SALT.matches(emailAuth.getSalt())) {
            return VerifyRegisterEmailResult.FAILURE;
        }
        emailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(
                emailAuth.getEmail(),
                emailAuth.getCode(),
                emailAuth.getSalt());

        if (emailAuth == null) { // userMapper로 가서 query문을 실행시켰는데 WHERE 조건문에서 `code` = #{code}가 없어서 null이 반환되었을 때(인증번호가 틀렸을 때!)
            return VerifyRegisterEmailResult.FAILURE_INVALID_CODE;
        }

        // new Date() : 현재 일시
        // emailAuth.getExpiresAt() : 만료 일시
        // compareTo() : 빼기라고 생각하면 됨.
        // 현재 일시 - 만료 일시 > 0 : 만료 일자가 지났다!
        if (new Date().compareTo(emailAuth.getExpiresAt()) > 0) {
            return VerifyRegisterEmailResult.FAILURE_EXPIRED;
        }
        emailAuth.setVerified(true);

        return this.userMapper.updateEmailAuth(emailAuth) > 0
                ? VerifyRegisterEmailResult.SUCCESS
                : VerifyRegisterEmailResult.FAILURE;
    }

    public RegisterResult register(UserEntity user, EmailAuthEntity emailAuth, boolean termMarketingAgreed) {
        if (!UserRegex.EMAIL.matches(user.getEmail()) ||
        !UserRegex.PASSWORD.matches(user.getPassword()) ||
        !UserRegex.NICKNAME.matches(user.getNickname()) ||
        !UserRegex.NAME.matches(user.getName()) ||
        !UserRegex.CONTACT_FIRST.matches(user.getContactFirst()) ||
        !UserRegex.CONTACT_SECOND.matches(user.getContactSecond()) ||
        !UserRegex.CONTACT_THIRD.matches(user.getContactThird()) ||
        !UserRegex.ADDRESS_POSTAL.matches(user.getAddressPostal()) ||
        !UserRegex.ADDRESS_PRIMARY.matches(user.getAddressPrimary()) ||
        !UserRegex.ADDRESS_SECONDARY.matches(user.getAddressSecondary()) ||
        !EmailAuthRegex.EMAIL.matches(emailAuth.getEmail()) ||
        !EmailAuthRegex.CODE.matches(emailAuth.getCode()) ||
        !EmailAuthRegex.SALT.matches(emailAuth.getSalt())) {
            return RegisterResult.FAILURE;
        }

        emailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(
                emailAuth.getEmail(),
                emailAuth.getCode(),
                emailAuth.getSalt());
        if (emailAuth == null || !emailAuth.isVerified()) {
            return RegisterResult.FAILURE;
        }

        if (this.userMapper.selectUserByEmail(user.getEmail()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }

        if (this.userMapper.selectUserByNickname(user.getNickname()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }

        if (this.userMapper.selectUserByContact(user.getContactFirst(), user.getContactSecond(), user.getContactThird()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_CONTACT;
        }

        user.setPassword(CryptoUtil.hashSha512(user.getPassword()));
        user.setAdmin(false);
        user.setDeleted(false);
        user.setSuspended(false);
        user.setRegisteredAt(new Date());
        user.setTermPolicyAt(user.getRegisteredAt());
        user.setTermPrivacyAt(user.getRegisteredAt());
        if (termMarketingAgreed) {
            user.setTermMarketingAt(user.getRegisteredAt());
        } else {
            user.setTermMarketingAt(null);
        }
        return this.userMapper.insertUser(user) > 0
                ? RegisterResult.SUCCESS
                : RegisterResult.FAILURE;
    }

    public LoginResult login(HttpSession session, UserEntity user) {
        // 이메일이나 비밀번호 형식이 옳지 않을 때
        if (!UserRegex.EMAIL.matches(user.getEmail()) || !UserRegex.PASSWORD.matches(user.getPassword())) {
            return LoginResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectUserByEmail(user.getEmail()); // users table에 로그인 할 때의 이메일이 존재하면, 해당 정보를 dbUser에 저장
        if (dbUser == null) { // users table에 이메일이 존재하지 않을 때
            return LoginResult.FAILURE;
        }
        // 비밀번호가 일치하지 않을 때
        if (!dbUser.getPassword().equals(CryptoUtil.hashSha512(user.getPassword()))) {
            return LoginResult.FAILURE;
        }
        // 정지된 계정일 때
        if (dbUser.isSuspended()) {
            return LoginResult.FAILURE_SUSPENDED;
        }
        // 위 조건들을 다 통과했다면 user에 있는 email과 password는 db에 있는 정보와 같음.
        // email과 password를 포함한 다른 모든 정보(dbUser에 있음)를 session에 "user" 이름으로 저장.
        session.setAttribute("user", dbUser);

        return LoginResult.SUCCESS;
    }

    public RecoverEmailResult recoverEmail(UserEntity user) {
        if (!UserRegex.NAME.matches(user.getName()) ||
                !UserRegex.CONTACT_FIRST.matches(user.getContactFirst()) ||
                !UserRegex.CONTACT_SECOND.matches(user.getContactSecond()) ||
                !UserRegex.CONTACT_THIRD.matches(user.getContactThird())) {

            return RecoverEmailResult.FAILURE;
        }

        // 연락처를 기준으로 select
        UserEntity dbUser = this.userMapper.selectUserByContact(
                user.getContactFirst(),
                user.getContactSecond(),
                user.getContactThird());

        if (dbUser == null) { // 연락처가 select가 안 되어서 null값이 왔을 때 (= 해당하는 연락처가 없을 때)
            return RecoverEmailResult.FAILURE;
        }

        if (!dbUser.getName().equals(user.getName())) {
            return RecoverEmailResult.FAILURE;
        }

        user.setEmail(dbUser.getEmail()); // UserEntity user에 dbUser에 넣은 Email을 set함.
                                          // why? Controller에게 "이 사용자의 email이 이거야." 라는 것을 알려줘야 함.

        return RecoverEmailResult.SUCCESS;
    }

    public SendResetPasswordEmailResult sendResetPasswordEmail(EmailAuthEntity emailAuth) throws MessagingException {
        if (!EmailAuthRegex.EMAIL.matches(emailAuth.getEmail())) {
            return SendResetPasswordEmailResult.FAILURE;
        }

        // db에 이메일이 없다면
        if (this.userMapper.selectUserByEmail(emailAuth.getEmail()) == null) {
            return SendResetPasswordEmailResult.FAILURE_UNKNOWN_EMAIL;
        }

        UserService.randomize(emailAuth);

//        new MailFactory(this.mailSender, this.templateEngine)
//                .setContextVariable("emailAuth", emailAuth)
//                .setTemplate("user/resetPasswordEmail")
//                .setTo(emailAuth.getEmail())
//                .setSubject("[BBS] 비밀번호 재설정 인증번호")
//                .send();

        Context context = new Context(); // emailAuth에 있는 데이터를 registerEmail.html로 넘기기 위한 객체 생성
        context.setVariable("emailAuth", emailAuth);
        String textHtml = this.templateEngine.process("user/resetPasswordEmail", context);
        MimeMessage message = this.mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message, false);
        messageHelper.setTo(emailAuth.getEmail());
        messageHelper.setSubject("[BBS] 비밀번호 재설정 인증번호");
        messageHelper.setText(textHtml, true);
        this.mailSender.send(message);

        return this.userMapper.insertEmailAuth(emailAuth) == 0 ? SendResetPasswordEmailResult.FAILURE : SendResetPasswordEmailResult.SUCCESS;
    }

    public VerifyResetPasswordEmailResult verifyResetPasswordEmail(EmailAuthEntity emailAuth) {
        if (!EmailAuthRegex.EMAIL.matches(emailAuth.getEmail()) ||
                !EmailAuthRegex.CODE.matches(emailAuth.getCode()) ||
                !EmailAuthRegex.SALT.matches(emailAuth.getSalt())) {
            return VerifyResetPasswordEmailResult.FAILURE;
        }
        emailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(
                emailAuth.getEmail(),
                emailAuth.getCode(),
                emailAuth.getSalt());

        if (emailAuth == null) { // userMapper로 가서 query문을 실행시켰는데 WHERE 조건문에서 `code` = #{code}가 없어서 null이 반환되었을 때(인증번호가 틀렸을 때!)
            return VerifyResetPasswordEmailResult.FAILURE_INVALID_CODE;
        }

        // new Date() : 현재 일시
        // emailAuth.getExpiresAt() : 만료 일시
        // compareTo() : 빼기라고 생각하면 됨.
        // 현재 일시 - 만료 일시 > 0 : 만료 일자가 지났다!
        if (new Date().compareTo(emailAuth.getExpiresAt()) > 0) {
            return VerifyResetPasswordEmailResult.FAILURE_EXPIRED;
        }
        emailAuth.setVerified(true);

        return this.userMapper.updateEmailAuth(emailAuth) > 0
                ? VerifyResetPasswordEmailResult.SUCCESS
                : VerifyResetPasswordEmailResult.FAILURE;
    }

    public ResetPasswordResult resetPassword(UserEntity user) {
        if(!UserRegex.PASSWORD.matches(user.getPassword())) {
            return ResetPasswordResult.FAILURE;
        }

        UserEntity dbUser = this.userMapper.selectUserByEmail(user.getEmail());

        if(dbUser.getPassword().equals(CryptoUtil.hashSha512(user.getPassword()))) {
            return ResetPasswordResult.FAILURE_DUPLICATE_PASSWORD;
        }

        user.setPassword(CryptoUtil.hashSha512(user.getPassword()));

        return this.userMapper.updateUser(user) > 0
                ? ResetPasswordResult.SUCCESS
                : ResetPasswordResult.FAILURE;
    }
}
