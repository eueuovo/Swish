package dev.dhkim.swish.controllers.main;

import dev.dhkim.swish.entities.user.EnhanceWandEntity;
import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.entities.user.WandEntity;
import dev.dhkim.swish.services.item.ItemService;
import dev.dhkim.swish.services.main.MainService;
import dev.dhkim.swish.services.user.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.apache.catalina.User;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/")
public class MainController {
    private final UserService userService;
    private final MainService mainService;
    private final ItemService itemService;

    @RequestMapping(value = "main", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getMain(ModelAndView modelAndView,
                                @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser, Model model){
        modelAndView.setViewName("main/main");

        modelAndView.addObject("dormRanking", mainService.getDormRanking());

        if (sessionUser != null) {
            WandEntity wand = userService.getWandById(sessionUser.getWandId());
            modelAndView.addObject("wand", wand);
            modelAndView.addObject("sessionUser", sessionUser);
            modelAndView.addObject("items", itemService.getAllItemsWithUserCount(sessionUser.getId()));

            if (sessionUser.getWandRank() > 1) {
                EnhanceWandEntity enhanceWand = userService.getEnhanceWand(sessionUser.getWandId(), sessionUser.getWandRank());
                modelAndView.addObject("enhanceWand", enhanceWand);
            }

            Map<String, Object> rewardInfo = mainService.getDailyRewardInfo(sessionUser);
            modelAndView.addAllObjects(rewardInfo);
        }

        return modelAndView;
    }

    @RequestMapping(value = "main/claim-reward", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> claimReward(
            @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser) {

        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요해요."));
        }

        Map<String, Object> result = mainService.claimDailyReward(sessionUser);
        return ResponseEntity.ok(result);
    }

    @RequestMapping(value = "main/enhance", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> enhance(
            @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser,
            @RequestParam(required = false) Integer itemId,
            HttpSession session) {

        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요해요."));
        }

        UserEntity freshUser = userService.findByLoginId(sessionUser.getLoginId());
        Map<String, Object> result = mainService.enhance(freshUser, itemId);
        session.setAttribute("sessionUser", freshUser);

        return ResponseEntity.ok(result);
    }

    @RequestMapping(value = "main/sell", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sell(
            @SessionAttribute(value = "sessionUser", required = false) UserEntity sessionUser,
            HttpSession session) {

        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요해요."));
        }

        // 최신 유저 가져오기 (강화랑 동일하게)
        UserEntity freshUser = userService.findByLoginId(sessionUser.getLoginId());

        Map<String, Object> result = mainService.sell(freshUser);

        // 세션 갱신
        session.setAttribute("sessionUser", freshUser);

        return ResponseEntity.ok(result);
    }
}
