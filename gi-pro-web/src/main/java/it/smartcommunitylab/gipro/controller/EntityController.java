/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.gipro.controller;

import it.smartcommunitylab.gipro.common.EntityNotFoundException;
import it.smartcommunitylab.gipro.common.UnauthorizedException;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.common.WrongRequestException;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.storage.DataSetSetup;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;


@Controller
public class EntityController {
	private static final transient Logger logger = LoggerFactory.getLogger(EntityController.class);
	
	@Autowired
	private RepositoryManager storageManager;

	@Autowired
	private DataSetSetup dataSetSetup;
	
	@RequestMapping(value = "/api/{applicationId}/professional/bypage", method = RequestMethod.GET)
	public @ResponseBody List<Professional> getProfessionals(@PathVariable String applicationId, 
			@RequestParam String type,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(Utils.isEmpty(type)) {
			throw new WrongRequestException("bad parameters");
		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<Professional> result = storageManager.findProfessional(applicationId, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfessionals[%s]:%d", applicationId, result.size()));
		}
		return result;
	}

	@RequestMapping(value = "/api/{applicationId}/professional/byids", method = RequestMethod.GET)
	public @ResponseBody List<Professional> getProfessionalsByIds(@PathVariable String applicationId, 
			@RequestParam String ids, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(Utils.isEmpty(ids)) {
			throw new WrongRequestException("bad parameters");
		}
		String[] idArray = ids.split(",");
		List<Professional> result = storageManager.findProfessionalByIds(applicationId, idArray);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfessionalsByIds[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/poi/bypage", method = RequestMethod.GET)
	public @ResponseBody List<Poi> getPois(@PathVariable String applicationId, 
			@RequestParam String type,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(Utils.isEmpty(type)) {
			throw new WrongRequestException("bad parameters");
		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<Poi> result = storageManager.findPoi(applicationId, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPois[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
		
	@RequestMapping(value = "/api/{applicationId}/poi/byids", method = RequestMethod.GET)
	public @ResponseBody List<Poi> getPoisByIds(@PathVariable String applicationId, 
			@RequestParam String ids,  
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(Utils.isEmpty(ids)) {
			throw new WrongRequestException("bad parameters");
		}
		String[] idArray = ids.split(",");
		List<Poi> result = storageManager.findPoiByIds(applicationId, idArray);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPoisByIds[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/searchoffer", method = RequestMethod.GET)
	public @ResponseBody List<ServiceOffer> searchServiceOffer(@PathVariable String applicationId, 
			@RequestParam String poiId,
			@RequestParam Long startTime,  
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(Utils.isEmpty(poiId) || (startTime == null)) {
			throw new WrongRequestException("bad parameters");
		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}		
		List<ServiceOffer> result = storageManager.searchServiceOffer(applicationId, startTime, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("searchServiceOffer[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer", method = RequestMethod.POST)
	public @ResponseBody ServiceOffer addServiceOffer(@PathVariable String applicationId,
			@RequestBody ServiceOffer serviceOffer,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		serviceOffer.setApplicationId(applicationId);
		ServiceOffer result = storageManager.saveServiceOffer(serviceOffer);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addServiceOffer[%s]:%s", applicationId, result.getObjectId()));
		}
		return result;		
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/public", method = RequestMethod.POST)
	public @ResponseBody ServiceRequest addPublicServiceRequest(@PathVariable String applicationId,
			@RequestBody ServiceRequest serviceRequest,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		serviceRequest.setApplicationId(applicationId);
		ServiceRequest result = storageManager.savePublicServiceRequest(serviceRequest);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addPublicServiceRequest[%s]:%s", applicationId, result.getObjectId()));
		}
		return result;		
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/private", method = RequestMethod.POST)
	public @ResponseBody ServiceRequest addPrivateServiceRequest(@PathVariable String applicationId,
			@RequestBody ServiceRequest serviceRequest,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		serviceRequest.setApplicationId(applicationId);
		ServiceRequest result = storageManager.savePrivateServiceRequest(serviceRequest);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addPrivateServiceRequest[%s]:%s", applicationId, result.getObjectId()));
		}
		return result;		
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<ServiceOffer> getServiceOffers(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<ServiceOffer> result = storageManager.getServiceOffers(applicationId, professionalId, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceOffers[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<ServiceRequest> getServiceRequests(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<ServiceRequest> result = storageManager.getServiceRequests(applicationId, professionalId, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceRequests[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{objectId}", method = RequestMethod.DELETE)
	public @ResponseBody ServiceOffer deleteServiceOffer(@PathVariable String applicationId,
			@PathVariable String objectId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		ServiceOffer result = storageManager.deleteServiceOffer(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteServiceOffer[%s]:%s", applicationId, objectId));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}", method = RequestMethod.DELETE)
	public @ResponseBody ServiceRequest deleteServiceRequest(@PathVariable String applicationId,
			@PathVariable String objectId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storageManager)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		ServiceRequest result = storageManager.deleteServiceRequest(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteServiceRequest[%s]:%s", applicationId, objectId));
		}
		return result;
	}
	
	@ExceptionHandler(WrongRequestException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
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
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
}
