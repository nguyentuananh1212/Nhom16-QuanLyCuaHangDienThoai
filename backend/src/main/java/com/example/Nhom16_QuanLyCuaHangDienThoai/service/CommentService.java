package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CommentRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CommentResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Comment;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.CommentRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public record CommentPage(PageResponse<CommentResponse> page, Double averageRating) {}

    @Transactional(readOnly = true)
    public CommentPage list(Long productId, int page, int size) {
        var result = PageResponse.of(commentRepository.findByProductId(productId,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "id"))),
                CommentResponse::from);
        return new CommentPage(result, commentRepository.averageRating(productId));
    }

    @Transactional
    public CommentResponse create(Long userId, Long productId, CommentRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> AppException.notFound("sản phẩm", productId));
        if (!orderRepository.hasPurchased(userId, productId, OrderStatus.DELIVERED)) {
            throw new AppException(ErrorCode.NOT_PURCHASED);
        }
        if (commentRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }
        Comment c = commentRepository.save(Comment.builder()
                .user(userRepository.getReferenceById(userId))
                .product(product)
                .rating(req.rating())
                .content(req.content().trim())
                .build());
        return CommentResponse.from(commentRepository.findById(c.getId()).orElseThrow());
    }

    /** Chủ comment hoặc nhân viên/admin được xoá. */
    @Transactional
    public void delete(Long userId, boolean isStaff, Long commentId) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> AppException.notFound("đánh giá", commentId));
        if (!isStaff && !c.getUser().getId().equals(userId)) throw new AppException(ErrorCode.FORBIDDEN);
        commentRepository.delete(c);
    }
}
