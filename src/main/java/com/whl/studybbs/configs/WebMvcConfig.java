package com.whl.studybbs.configs;

import com.whl.studybbs.interceptors.CommonInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // 설정 클래스로 지정을 위한 Annotation
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this.commonInterceptor())
                .addPathPatterns("/**") // 모든 요청 주소에 대해서 CommonInterceptor()를 활성화
                .excludePathPatterns("/resources/**") // 주소 제외
                .excludePathPatterns("/user/resources/**") // 주소 제외
                .excludePathPatterns("/article/resources/**");
    }

    @Bean // @Resource가 붙어 있는 객체를 객체화해줌.
          // 위 registry.addInterceptor에 new commonInterceptor() 를 주면 얘는 @Resource가 붙어 있는 객체가 객체화가 되어 있지 않음. 그래서 @Bean으로 수동으로 객체화를 시켜주어야 함.
    public CommonInterceptor commonInterceptor() {
        return new CommonInterceptor();
    }
}
