using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;
using System.Net;
using System.ComponentModel.DataAnnotations;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();


            if (!this.ModelState.IsValid)
            {
                //List<string> erros = (from item in ModelState.Values
                //                      from error in item.Errors
                //                      select error.ErrorMessage).ToList();

                List<string> errosObjects = (from item in ModelState
                                                     where item.Value.Errors.Count() > 0
                                                     select "Erro no campo " +
                                                         item.Key.ToString() + " - " +
                                                         item.Value.Errors.First().ErrorMessage.ToString())
                                                         .ToList();

                Response.StatusCode = 400;
                return Json(string.Join("<br><hr>", errosObjects));
            }
            else
            {
                //Verifica se existe outro CPF igual no sistema
                if (bo.VerificarExistencia(model.CPF))
                {
                    Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return Json("Já Existe um usuario com o CPF inserido!!");
                }

                model.Id = bo.Incluir(new Cliente()
                {                    
                    CEP = model.CEP,
                    CPF = model.CPF,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone
                });

                foreach (var Beneficiario in model.Beneficiarios)
                {
                    boBeneficiario.Incluir(new Beneficiario
                    {
                        Nome = Beneficiario.Nome,
                        CPF = Beneficiario.CPF,
                        IdCliente = model.Id
                    });
                }
                return Json("Cadastro efetuado com sucesso");
            }
        }

        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();


            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else
            {
                Cliente cliente = bo.Consultar(model.Id);

                if (cliente != null && cliente.CPF != model.CPF)
                {
                    //Verifica se existe outro CPF igual no sistema
                    if (bo.VerificarExistencia(model.CPF))
                    {
                        Response.StatusCode = (int) HttpStatusCode.BadRequest;
                        return Json("Já Existe um usuario com o CPF inserido!!" );
                    }
                }

                bo.Alterar(new Cliente()
                {
                    Id = model.Id,
                    CEP = model.CEP,
                    CPF = model.CPF,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone
                });

                return Json("Cadastro alterado com sucesso");
            }
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();
            Cliente cliente = bo.Consultar(id);
            List<Beneficiario> beneficiarios = boBeneficiario.Pesquisa(id);
            List<BeneficiarioModel> beneficiariosmodel = new List<BeneficiarioModel>();

            foreach (var beneficiario in beneficiarios )
            {
                beneficiariosmodel.Add(new BeneficiarioModel { 
                    Id = beneficiario.Id,
                    Nome = beneficiario.Nome,
                    CPF = beneficiario.CPF,
                    IdCliente = beneficiario.IdCliente
                });
            }
            Models.ClienteModel model = null;

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    CEP = cliente.CEP,
                    CPF = cliente.CPF,
                    Cidade = cliente.Cidade,
                    Email = cliente.Email,
                    Estado = cliente.Estado,
                    Logradouro = cliente.Logradouro,
                    Nacionalidade = cliente.Nacionalidade,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    Telefone = cliente.Telefone,
                    Beneficiarios = beneficiariosmodel
                };

            
            }

            return View(model);
        }

        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
    }
}