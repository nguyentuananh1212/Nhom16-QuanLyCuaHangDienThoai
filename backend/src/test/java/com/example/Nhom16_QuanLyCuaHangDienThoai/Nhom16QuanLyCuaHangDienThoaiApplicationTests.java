package com.example.Nhom16_QuanLyCuaHangDienThoai;

import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class Nhom16QuanLyCuaHangDienThoaiApplicationTests {

    @Autowired MockMvc mvc;
    @Autowired ProductRepository productRepository;

    private static final String CHECKOUT = """
            {"receiverName":"Nguyen Van A","receiverPhone":"0901234567",
             "receiverEmail":"test@gmail.com",
             "shippingAddress":"1 Le Loi, Q1","paymentMethod":"COD"}""";

    private String register() throws Exception {
        String email = "u" + UUID.randomUUID().toString().substring(0, 8) + "@test.vn";
        MvcResult r = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"secret1\",\"fullName\":\"Khach\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andReturn();
        return "Bearer " + JsonPath.read(r.getResponse().getContentAsString(), "$.accessToken");
    }

    private String adminToken() throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.vn\",\"password\":\"Admin@123\"}"))
                .andExpect(status().isOk()).andReturn();
        return "Bearer " + JsonPath.read(r.getResponse().getContentAsString(), "$.accessToken");
    }

    private long createProduct(String admin, int stock) throws Exception {
        String body = """
                {"name":"Test phone %s","price":10000000,"salePrice":9000000,"stock":%d,"brandId":1,"categoryId":1}"""
                .formatted(UUID.randomUUID(), stock);
        MvcResult r = mvc.perform(post("/api/admin/products").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn();
        return ((Number) JsonPath.read(r.getResponse().getContentAsString(), "$.id")).longValue();
    }

    private void addToCart(String token, long productId, int qty) throws Exception {
        mvc.perform(post("/api/cart/items").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":" + productId + ",\"quantity\":" + qty + "}"))
                .andExpect(status().isOk());
    }

    @Test
    void publicEndpointsAndSeedData() throws Exception {
        mvc.perform(get("/api/products").param("keyword", "iphone"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/api/products").param("onSale", "true").param("sort", "price_asc"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/products/hot")).andExpect(status().isOk());
        mvc.perform(get("/api/products/sale")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].discountPercent").exists());
        mvc.perform(get("/api/products/most-viewed")).andExpect(status().isOk());
        mvc.perform(post("/api/products/1/view")).andExpect(status().isNoContent());
        mvc.perform(get("/api/products/1")).andExpect(jsonPath("$.viewCount").value(1));
        mvc.perform(get("/api/brands")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void securityRules() throws Exception {
        mvc.perform(get("/api/cart")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/cart").header("Authorization", "Bearer abc.def.ghi")).andExpect(status().isUnauthorized());
        String customer = register();
        mvc.perform(get("/api/admin/dashboard").header("Authorization", customer)).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/brands").header("Authorization", customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Hack\"}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@test.vn\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"bad\",\"password\":\"1\",\"fullName\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.email").exists());
        mvc.perform(get("/api/admin/dashboard").header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").isNumber());
    }

    @Test
    void checkoutDeductsStockAndCancelRestores() throws Exception {
        String admin = adminToken();
        long pid = createProduct(admin, 5);
        String customer = register();

        addToCart(customer, pid, 3);
        // Vượt tồn kho khi thêm giỏ
        mvc.perform(post("/api/cart/items").header("Authorization", customer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":" + pid + ",\"quantity\":3}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("OUT_OF_STOCK"));

        MvcResult r = mvc.perform(post("/api/orders").header("Authorization", customer)
                        .contentType(MediaType.APPLICATION_JSON).content(CHECKOUT))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount").value(27000000))
                .andExpect(jsonPath("$.items[0].unitPrice").value(9000000))
                .andReturn();
        long orderId = ((Number) JsonPath.read(r.getResponse().getContentAsString(), "$.id")).longValue();
        assertThat(productRepository.findById(pid).orElseThrow().getStock()).isEqualTo(2);

        // Giỏ đã được xoá
        mvc.perform(get("/api/cart").header("Authorization", customer)).andExpect(jsonPath("$.items.length()").value(0));
        mvc.perform(post("/api/orders").header("Authorization", customer)
                .contentType(MediaType.APPLICATION_JSON).content(CHECKOUT)).andExpect(jsonPath("$.code").value("CART_EMPTY"));

        // IDOR: khách khác không xem / huỷ được
        String other = register();
        mvc.perform(get("/api/orders/" + orderId).header("Authorization", other)).andExpect(status().isNotFound());
        mvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", other)).andExpect(status().isNotFound());

        // Chưa nhận hàng thì chưa được đánh giá
        mvc.perform(post("/api/products/" + pid + "/comments").header("Authorization", customer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"rating\":5,\"content\":\"Tot\"}"))
                .andExpect(status().isForbidden());

        // Chủ đơn huỷ -> hoàn kho
        mvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", customer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
        assertThat(productRepository.findById(pid).orElseThrow().getStock()).isEqualTo(5);
        assertThat(productRepository.findById(pid).orElseThrow().getSoldCount()).isZero();

        // Đơn đã huỷ không chuyển tiếp được
        mvc.perform(put("/api/admin/orders/" + orderId + "/status").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void fullLifecycleThenReview() throws Exception {
        String admin = adminToken();
        long pid = createProduct(admin, 10);
        String customer = register();
        addToCart(customer, pid, 1);
        MvcResult r = mvc.perform(post("/api/orders").header("Authorization", customer)
                .contentType(MediaType.APPLICATION_JSON).content(CHECKOUT)).andExpect(status().isCreated()).andReturn();
        long orderId = ((Number) JsonPath.read(r.getResponse().getContentAsString(), "$.id")).longValue();

        // Nhảy cóc trạng thái bị chặn
        mvc.perform(put("/api/admin/orders/" + orderId + "/status").header("Authorization", admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"DELIVERED\"}")).andExpect(status().isConflict());
        for (String s : List.of("CONFIRMED", "SHIPPING", "DELIVERED")) {
            mvc.perform(put("/api/admin/orders/" + orderId + "/status").header("Authorization", admin)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"" + s + "\"}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.status").value(s));
        }
        mvc.perform(post("/api/products/" + pid + "/comments").header("Authorization", customer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"rating\":5,\"content\":\"May dep\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/products/" + pid + "/comments").header("Authorization", customer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"rating\":4,\"content\":\"Lan 2\"}"))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/products/" + pid + "/comments"))
                .andExpect(jsonPath("$.averageRating").value(5.0))
                .andExpect(jsonPath("$.page.totalElements").value(1));
        mvc.perform(get("/api/admin/dashboard").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenueLast30Days[0].revenue").isNumber());
    }

    /** 10 khách cùng đặt mua sản phẩm chỉ còn 3 chiếc -> đúng 3 đơn thành công, kho không âm. */
    @Test
    void concurrentCheckoutNeverOversells() throws Exception {
        String admin = adminToken();
        long pid = createProduct(admin, 3);
        List<String> customers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            String c = register();
            addToCart(c, pid, 1);
            customers.add(c);
        }
        ExecutorService pool = Executors.newFixedThreadPool(10);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> results = new ArrayList<>();
        for (String c : customers) {
            results.add(pool.submit(() -> {
                start.await();
                return mvc.perform(post("/api/orders").header("Authorization", c)
                        .contentType(MediaType.APPLICATION_JSON).content(CHECKOUT)).andReturn().getResponse().getStatus();
            }));
        }
        start.countDown();
        int ok = 0;
        for (Future<Integer> f : results) if (f.get(30, TimeUnit.SECONDS) == 201) ok++;
        pool.shutdown();
        assertThat(ok).isEqualTo(3);
        assertThat(productRepository.findById(pid).orElseThrow().getStock()).isZero();
    }
}
