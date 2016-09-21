package it.smartcommunitylab.gipro.config;

import it.smartcommunitylab.gipro.security.AppUserDetails;
import it.smartcommunitylab.gipro.security.TokenAuthFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebMvcSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private Environment env;	
	
	@Autowired
	private AuthenticationProvider tokenAuthProvider;

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth
		.authenticationProvider(tokenAuthProvider);
	}
	
	@Autowired
	@Value("${rememberme.key}")
	private String rememberMeKey;	

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
		.csrf()
		.disable();
				
		http
		.authorizeRequests()
		.antMatchers(HttpMethod.OPTIONS,"/**").permitAll()
		.antMatchers("/api/**")
		.hasAnyAuthority(AppUserDetails.GIPRO)
		.and()
		.addFilterBefore(tokenFilter(), BasicAuthenticationFilter.class)
		.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		
		http
			.authorizeRequests()
			.antMatchers("/", "/console/**", "/upload/**")
			.authenticated()
			.anyRequest()
			.permitAll();
		
		http.formLogin().loginPage("/login").permitAll().and().logout().permitAll().deleteCookies("rememberme","JSESSIONID");
	}

	@Bean 
	public TokenAuthFilter tokenFilter() throws Exception{
		 return new TokenAuthFilter();
	}
	
	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}	

}
