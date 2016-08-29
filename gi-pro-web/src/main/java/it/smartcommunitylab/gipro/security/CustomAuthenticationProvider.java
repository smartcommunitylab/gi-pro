package it.smartcommunitylab.gipro.security;

import it.smartcommunitylab.gipro.storage.DataSetSetup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

	@Autowired
	private DataSetSetup datasetSetup;
	
	@Override
	protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
	}
	
	@Override
	protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		if(AppUserDetails.isAppUser(authentication)) {
			return new AppUserDetails(username);
		}
		DataSetInfo dataset = datasetSetup.findDataSetById(username);
		if (dataset == null) {
			throw new UsernameNotFoundException(username);
		}
		if (!dataset.getPassword().equals(authentication.getCredentials().toString())) {
			throw new BadCredentialsException("Incorrect password");
		}
		return new DataSetDetails(dataset);
	}

}
