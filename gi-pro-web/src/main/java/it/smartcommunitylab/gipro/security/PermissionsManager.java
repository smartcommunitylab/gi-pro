package it.smartcommunitylab.gipro.security;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.stereotype.Component;

@Component
public class PermissionsManager {
	
	@Autowired
	private RepositoryManager storageManager;
	
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private RememberMeServices rememberMeServices;
	
	public void authenticateByCF(HttpServletRequest request, HttpServletResponse response, Professional profile) {
		UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
				profile.getObjectId(), profile.getCf(), AppUserDetails.GIPRO_AUTHORITIES);
		token.setDetails(profile);
		Authentication authenticatedUser = authenticationManager.authenticate(token);
		SecurityContextHolder.getContext().setAuthentication(authenticatedUser);
		rememberMeServices.loginSuccess(request, response, authenticatedUser);
	}
}
