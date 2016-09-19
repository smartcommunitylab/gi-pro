package it.smartcommunitylab.gipro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import it.smartcommunitylab.gipro.model.Professional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtUtils {

	@Value("${rememberme.key}")
	private String secret;

	public Professional parseToken(String token) {
		try {
			Claims body = Jwts.parser().setSigningKey(secret)
					.parseClaimsJws(token).getBody();

			Professional p = new Professional();
			p.setObjectId(body.getSubject());
			p.setCf((String) body.get("cf"));
			return p;

		} catch (JwtException | ClassCastException e) {
			return null;
		}
	}

	public String generateToken(Professional p) {
		Claims claims = Jwts.claims().setSubject(p.getObjectId());
		claims.put("cf", p.getCf());

		return Jwts.builder().setClaims(claims)
				.signWith(SignatureAlgorithm.HS512, secret).compact();
	}
}
