package it.smartcommunitylab.gipro.config;

import it.smartcommunitylab.gipro.security.AppUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.RememberMeAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebMvcSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private Environment env;	
	
	@Autowired
	private UserDetailsService userDetailsServiceImpl;
	
	@Autowired
	private AuthenticationProvider customAuthenticationProvider;

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth
		.authenticationProvider(customAuthenticationProvider)
		.authenticationProvider(rememberMeAuthenticationProvider());
	}
	
	@Autowired
	@Value("${rememberme.key}")
	private String rememberMeKey;	

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
		.rememberMe();	
		
//		http
//			.headers()
//			.frameOptions().disable();
		
		http
//		.csrf()
//		.disable()
		.authorizeRequests()
//		.antMatchers(HttpMethod.OPTIONS,"/**").permitAll()
		.antMatchers("/api/**")
		.hasAnyAuthority(AppUserDetails.GIPRO)
		.and()
		.addFilterBefore(rememberMeAuthenticationFilter(), BasicAuthenticationFilter.class);
		
		http
			.csrf()
			.disable()
			.authorizeRequests()
			.antMatchers("/", "/console/**", "/upload/**")
			.authenticated()
			.anyRequest()
			.permitAll();
		
		http.formLogin().loginPage("/login").permitAll().and().logout().permitAll().deleteCookies("rememberme","JSESSIONID");
	}
	
	@Bean 
	public RememberMeAuthenticationFilter rememberMeAuthenticationFilter() throws Exception{
		 return new RememberMeAuthenticationFilter(authenticationManager(), tokenBasedRememberMeService());
	}
	
	public RememberMeAuthenticationProvider rememberMeAuthenticationProvider(){
		 return new RememberMeAuthenticationProvider(tokenBasedRememberMeService().getKey());
	}
	
	@Bean 
	public TokenBasedRememberMeServices tokenBasedRememberMeService(){
		 TokenBasedRememberMeServices service = new TokenBasedRememberMeServices(env.getProperty("rememberme.key"), userDetailsServiceImpl);
		 service.setAlwaysRemember(true);
		 service.setCookieName("rememberme");
		 service.setTokenValiditySeconds(3600*24*365*1);
		 return service;
	}
	
	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}	

}
