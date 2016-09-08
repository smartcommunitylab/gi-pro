package it.smartcommunitylab.gipro.controller;

import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.converter.Converter;
import it.smartcommunitylab.gipro.exception.AlreadyRegisteredException;
import it.smartcommunitylab.gipro.exception.RegistrationException;
import it.smartcommunitylab.gipro.exception.UnauthorizedException;
import it.smartcommunitylab.gipro.exception.WrongRequestException;
import it.smartcommunitylab.gipro.integration.CNF;
import it.smartcommunitylab.gipro.mail.MailSender;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.security.PermissionsManager;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class RegistrationController {
	private static final transient Logger logger = LoggerFactory.getLogger(RegistrationController.class);

	@Autowired
	private RepositoryManager storageManager;
	
	@Autowired
	private PermissionsManager permissionsManager; 
	
	@Autowired
	private MailSender mailSender;	

	@RequestMapping(value = "/login", method = RequestMethod.GET)
	public String loginPage(HttpServletRequest req) {
		return "registration/login";
	}
	
	@RequestMapping(value = "/login/{applicationId}", method = RequestMethod.POST)
	public @ResponseBody Professional login(@PathVariable String applicationId,
			@RequestParam String cf, 
			@RequestParam String password,
			Model model, HttpServletRequest request, HttpServletResponse response) 
					throws Exception {
		try {
			Professional profile = CNF.getProfile(applicationId, cf, null);
			if(profile == null) {
				throw new UnauthorizedException("profile not found");
			}
			profile = storageManager.loginByCF(applicationId, cf, password);
			if(profile == null) {
				throw new UnauthorizedException("profile not found or invalid credentials");
			}
			permissionsManager.authenticateByCF(request, response, profile);
			return profile;
		} catch (Exception e) {
			logger.error(e.getMessage());
			throw new UnauthorizedException("profile not found");
		}
	}
	
	@RequestMapping(value = "/register", method = RequestMethod.GET)
	public String regPage(Model model, HttpServletRequest req) {
		model.addAttribute("reg", new Registration());
		return "registration/register";
	}

	@RequestMapping(value = "/register/{applicationId}/rest", method = RequestMethod.POST)
	public @ResponseBody void registerREST(@PathVariable String applicationId,
			@RequestParam String cf,
			@RequestParam String password,
			@RequestParam String mail,
			@RequestParam String lang,
			@RequestParam(required=false) String name,			
			@RequestParam(required=false) String surname,
			HttpServletResponse res) throws Exception {
		Professional profile = CNF.getProfile(applicationId, cf, mail);
		if(profile == null) {
			throw new UnauthorizedException("profile not found");
		}
		Registration registration = Converter.convertProfessionalToRegistration(profile, password, lang);
		Registration result = storageManager.registerUser(registration);
		mailSender.sendConfirmationMail(result);
	}
	
	@RequestMapping(value = "/confirm", method = RequestMethod.GET)
	public ModelAndView confirm(Model model, @RequestParam String confirmationCode, HttpServletRequest req) {
		try {
			Registration confirmUser = storageManager.confirmUser(confirmationCode);
			Professional professional = Converter.convertRegistrationToProfessional(confirmUser);
			Professional profile = CNF.getProfile(professional.getApplicationId(), 
					professional.getCf(), professional.getMail());
			professional.setAddress(profile.getAddress());
			professional.setFax(profile.getFax());
			professional.setPiva(profile.getPiva());
			professional.setType(profile.getType());
			professional.setCustomProperties(profile.getCustomProperties());
			storageManager.saveProfessionalbyCF(professional);
			return new ModelAndView("registration/confirmsuccess");
		} catch (Exception e) {
			logger.error(e.getMessage());
			model.addAttribute("error", e.getClass().getSimpleName());
			return new ModelAndView("registration/confirmerror");
		}
	}
	
	@RequestMapping(value = "/resend", method = RequestMethod.GET)
	public String resendPage() {
		return "registration/resend";
	}
	
	@RequestMapping(value = "/resend", method = RequestMethod.POST)
	public ModelAndView resendConfirm(Model model, @RequestParam String cf) {
		try {
			Registration result = storageManager.resendConfirm(cf);
			mailSender.sendConfirmationMail(result);
			return new ModelAndView("registration/regsuccess");
		} catch (Exception e) {
			logger.error(e.getMessage());
			model.addAttribute("error", e.getClass().getSimpleName());
			return new ModelAndView("registration/resend");
		}
	}

	@RequestMapping(value = "/reset", method = RequestMethod.GET)
	public String resetPage() {
		return "registration/resetpwd";
	}
	
	@RequestMapping(value = "/reset", method = RequestMethod.POST)
	public ModelAndView reset(Model model, @RequestParam String cf,
			HttpServletRequest req) {
		try {
			Registration result = storageManager.resetPassword(cf);
			req.getSession().setAttribute("changePwdCF", result.getMail());
			req.getSession().setAttribute("confirmationCode", result.getConfirmationKey());
			mailSender.sendResetMail(result);
		} catch (Exception e) {
			logger.error(e.getMessage());
			model.addAttribute("error", e.getClass().getSimpleName());
			return new ModelAndView("registration/resetpwd");
		}
		return new ModelAndView("registration/resetsuccess");
	}
	
	
	@RequestMapping(value = "/changepwd", method = RequestMethod.GET)
	public String changePasswordPage(@RequestParam String confirmationCode,
			@RequestParam String cf, HttpServletRequest req) {
		req.getSession().setAttribute("changePwdCF", cf);
		req.getSession().setAttribute("confirmationCode", confirmationCode);
		return "registration/changepwd";
	}
	
	@RequestMapping(value = "/changepwd", method = RequestMethod.POST)
	public ModelAndView changePassword(Model model,	
			@RequestParam String cf,
			@RequestParam String confirmationCode,
			@RequestParam String password,
			HttpServletRequest req) {
		try {
			storageManager.updatePassword(cf, password, confirmationCode);
		} catch (Exception e) {
			logger.error(e.getMessage());
			model.addAttribute("error", e.getClass().getSimpleName());
			return new ModelAndView("registration/changepwd");
		}
		return new ModelAndView("registration/changesuccess");
	}
		
	@ExceptionHandler(WrongRequestException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(AlreadyRegisteredException.class)
	@ResponseStatus(value=HttpStatus.CONFLICT)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(RegistrationException.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleRegistrationError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}	
}
