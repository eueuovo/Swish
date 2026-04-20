package dev.dhkim.swish.controllers.user;

import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.services.user.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import dev.dhkim.swish.entities.user.EmailTokensEntity;
import dev.dhkim.swish.enums.SendEmailResult;
import dev.dhkim.swish.enums.VerifyEmailResult;
import jakarta.mail.MessagingException;
import org.apache.commons.lang3.tuple.Pair;

import javax.print.attribute.standard.Media;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;

    //회원가입 페이지
    @RequestMapping(value = "/register", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getRegister(ModelAndView modelAndView, Model model) {
        modelAndView.setViewName("user/register");
        return modelAndView;
    }

    //기숙사 배정 페이지
    @RequestMapping(value = "/dorm", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getDorm(ModelAndView modelAndView, Model model,
                                @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser) {

        if (sessionUser != null && sessionUser.getDormId() != null) {
            modelAndView.setViewName("redirect:/main");
            return modelAndView;
        }

        modelAndView.setViewName("user/dorm");
        modelAndView.addObject("questions", userService.getQuestionWithAnswers());
        return modelAndView;
    }

    //기숙사 배정 완료 처리
    @RequestMapping(value = "/dorm", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postDorm(@RequestBody Map<String, Integer> body,
                                        HttpSession session){

        Map<String, Object> response = new HashMap<>();

        UserEntity user = (UserEntity) session.getAttribute("sessionUser");

        int dormId = body.get("dormId");

        userService.updateDorm(user.getId(), dormId);

        user.setDormId(dormId);
        session.setAttribute("sessionUser", user);

        response.put("result", "SUCCESS");
        return response;
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getLogin(ModelAndView modelAndView,
                           @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser) {
        if (sessionUser != null) {
            modelAndView.setViewName("redirect:/main");
            return modelAndView;
        }
        modelAndView.setViewName("user/login");
        return modelAndView;
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postLogin(@RequestParam String id,
                                         @RequestParam String password,
                                             HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        UserEntity user = userService.login(id, password);

        if (user != null) {
            session.setAttribute("sessionUser", user);
            result.put("success", true);
        } else {
            result.put("success", false);
            result.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return result;
    }

    @RequestMapping(value = "/logout", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogout(HttpSession session) {
        Object sessionUser = session.getAttribute("sessionUser");
        if (sessionUser != null) {
            session.removeAttribute("sessionUser");
        }
        return "redirect:/main";
    }

    @RequestMapping(value = "/email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postEmail(@RequestParam(value = "email", required = false) String email,
                                         @RequestParam(value = "type", required = false, defaultValue = "0") int type) throws MessagingException {
        Pair<SendEmailResult, EmailTokensEntity> result = userService.sendEmail(email, type);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.getLeft().name());
        if (result.getLeft() == SendEmailResult.SUCCESS) {
            response.put("salt", result.getRight().getSalt());
        }
        return response;
    }

    @RequestMapping(value = "/email", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchEmail(@RequestParam(value = "email", required = false) String email,
                                          @RequestParam(value = "code", required = false) String code,
                                          @RequestParam(value = "salt", required = false) String salt) {
        EmailTokensEntity emailToken = new EmailTokensEntity();
        emailToken.setEmail(email);
        emailToken.setCode(code);
        emailToken.setSalt(salt);
        VerifyEmailResult result = userService.verifyEmail(emailToken);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/nickname-status", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getNicknameStatus(@RequestParam String nickname) {
        Map<String, Object> response = new HashMap<>();
        boolean available = userService.isNicknameAvailable(nickname);
        response.put("result", available ? "SUCCESS" : "FAILURE");
        return response;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postRegister(
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam String salt,
            @RequestParam String loginId,
            @RequestParam String password,
            @RequestParam String nickname,
            @RequestParam String contact){
        Map<String, Object> response = new HashMap<>();

        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);
        userEntity.setPassword(password);
        userEntity.setNickname(nickname);
        userEntity.setContact(contact);
        userEntity.setLoginId(loginId);

        userService.register(userEntity);
        response.put("result", "SUCCESS");
        return response;
    }
}
