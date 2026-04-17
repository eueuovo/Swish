package dev.dhkim.swish.services.user;

import dev.dhkim.swish.entities.user.*;
import dev.dhkim.swish.enums.SendEmailResult;
import dev.dhkim.swish.enums.VerifyEmailResult;
import dev.dhkim.swish.mappers.DormMapper;
import dev.dhkim.swish.mappers.EmailTokenMapper;
import dev.dhkim.swish.mappers.UserMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;

import org.thymeleaf.context.Context;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailTokenMapper emailTokenMapper;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final DormMapper dormMapper;

    public void register(UserEntity userEntity){
        userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
        userMapper.register(userEntity);
    }

    public UserEntity login(String loginId, String password){
        UserEntity user = userMapper.findByLoginId(loginId);
        if (user != null && passwordEncoder.matches(password, user.getPassword())){
            return user;
        }
        return null;
    }

    public Pair<SendEmailResult, EmailTokensEntity> sendEmail(String email, int type) throws MessagingException {
        if (email == null || !email.matches("^(?=.{8,50}$)([\\da-zA-Z_.]{4,25})@([\\da-z\\-]+\\.)?([\\da-z\\-]{2,})\\.([a-z]{2,15}\\.)?([a-z]{2,3})$")) {
            return Pair.of(SendEmailResult.FAILURE, null);
        }
        String subject = switch (type) {
            case 0 -> "[Swish] 회원가입 인증번호 안내";
            case 1 -> "[Swish] 비밀번호 재설정 인증번호 안내";
            default -> null;
        };
        if (subject == null) {
            return Pair.of(SendEmailResult.FAILURE, null);
        }
        String code = String.valueOf((int)(Math.random() * 900000) + 100000);
        String salt = new BCryptPasswordEncoder().encode(email + code + Math.random());

        EmailTokensEntity emailToken = new EmailTokensEntity();
        emailToken.setEmail(email);
        emailToken.setCode(code);
        emailToken.setSalt(salt);
        emailToken.setVerified(false);
        emailToken.setUsed(false);
        emailToken.setCreatedAt(LocalDateTime.now());
        emailToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));

        if (emailTokenMapper.insert(emailToken) < 1) {
            return Pair.of(SendEmailResult.FAILURE, null);
        }

        Context context = new Context();
        context.setVariable("type", switch (type) {
            case 0 -> "회원가입";
            case 1 -> "비밀번호 재설정";
            default -> throw new RuntimeException();
        });
        context.setVariable("code", code);
        String body = templateEngine.process("user/sendEmail", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom("your@gmail.com");
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(body, true);
        mailSender.send(message);

        return Pair.of(SendEmailResult.SUCCESS, emailToken);
    }

    public VerifyEmailResult verifyEmail(EmailTokensEntity emailToken) {
        if (emailToken == null ||
                emailToken.getEmail() == null ||
                emailToken.getCode() == null ||
                emailToken.getSalt() == null) {
            return VerifyEmailResult.FAILURE;
        }
        EmailTokensEntity dbToken = emailTokenMapper.select(
                emailToken.getEmail(),
                emailToken.getCode(),
                emailToken.getSalt()
        );
        if (dbToken == null || dbToken.isUsed() || dbToken.isVerified()) {
            return VerifyEmailResult.FAILURE;
        }
        if (dbToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return VerifyEmailResult.FAILURE_EXPIRED;
        }
        dbToken.setVerified(true);
        return emailTokenMapper.update(dbToken) > 0
                ? VerifyEmailResult.SUCCESS
                : VerifyEmailResult.FAILURE;
    }

    public boolean isNicknameAvailable(String nickname) {
        return userMapper.findByNickname(nickname) == null;
    }

    public void updateDorm(int userId, int dormId) {
        dormMapper.updateUserDorm(userId, dormId);

        List<WandEntity> wands = userMapper.findAllWands();
        double totalProb = wands.stream().mapToDouble(WandEntity::getProbability).sum();
        double random = Math.random() * totalProb;

        double cumulative = 0;
        int selectedWandId = wands.get(0).getId();
        for (WandEntity wand : wands) {
            cumulative += wand.getProbability();
            if (random <= cumulative) {
                selectedWandId = wand.getId();
                break;
            }
        }
        userMapper.updateWand(userId, selectedWandId);
    }

    public List<DormQuestionEntity> getQuestionWithAnswers() {
        return dormMapper.selectQuestionsWithAnswers();
    }

    public WandEntity getWandById(int wandId) {
        return userMapper.findWandById(wandId);
    }

    public EnhanceWandEntity getEnhanceWand(int wandId, int rank) {
        return userMapper.findEnhanceWand(wandId, rank);
    }

    public UserEntity findByLoginId(String loginId) {
        return userMapper.findByLoginId(loginId);
    }
}
