package dev.dhkim.swish.services.item;

import dev.dhkim.swish.dto.UserItemDto;
import dev.dhkim.swish.entities.item.ItemEntity;
import dev.dhkim.swish.mappers.ItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemMapper itemMapper;

    public ItemEntity getItemById(int id) {
        return itemMapper.findById(id);
    }

    public List<UserItemDto> getUserItems(int userId) {
        return itemMapper.findByUserId(userId);
    }

    public List<UserItemDto> getAllItemsWithUserCount(int userId) {
        return itemMapper.findAllWithUserCount(userId);
    }

    public boolean userHasItem(int userId, int itemId) {
        return itemMapper.countUserItem(userId, itemId) > 0;
    }

    public void useItem(int userId, int itemId) {
        itemMapper.decreaseItemCount(userId, itemId);
    }
}
