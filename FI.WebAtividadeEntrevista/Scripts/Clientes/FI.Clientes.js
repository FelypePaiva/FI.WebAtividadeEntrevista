
$(document).ready(function () {
    $('.cpf').mask('000.000.000-00', { reverse: true });
    $('#formCadastro').submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "NOME": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "CPF": $(this).find("#CPF").val().replaceAll('.', '').replaceAll('-', ''),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "Beneficiarios": listarNovosBeneficiariosArrayObjects()

            },
            error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON);
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
            success:
            function (r) {
                ModalDialog("Sucesso!", r)
                $("#formCadastro")[0].reset();
            }
        });
    })
    
    $('#FormCadastroBeneficiario').submit(function (e) {
        e.preventDefault();
        let acao = $("#btn-incluir").data('acao');
        let beneficiarioNome = $('#BeneficiarioNome').val();
        let beneficiarioCPF = $('#BeneficiarioCPF').val();
        if (acao == 'Incluir') {
            if (!existeMesmoCPFNaLista(beneficiarioCPF.replaceAll('.', '').replaceAll('-', ''))) {
                IncluirBeneficiario(beneficiarioNome, beneficiarioCPF);
                $('#BeneficiarioNome').val('');
                $('#BeneficiarioCPF').val('');
                elementoParaAlterar = null;

            } else {
                ModalDialog("Ocorreu um erro", "Não é possivel Cadastrar este CPF pois ele já está presente na Lista!!!");
            }

        } else if (acao == 'Alterar') {
            if (!existeMesmoCPFNaLista(beneficiarioCPF.replaceAll('.', '').replaceAll('-', ''))) {
                AlterarBeneficiario();
                AlternarEvendoDeInclusaoOuAlteracao('Incluir')
                elementoParaAlterar.style.backgroundColor = "#fff";
                $('#BeneficiarioNome').val('');
                $('#BeneficiarioCPF').val('');
                elementoParaAlterar = null;

            } else {
                ModalDialog("Ocorreu um erro", "Não é possivel Cadastrar este CPF pois ele já está presente na Lista!!!");
            }

        }
    })
    $('#btnModalBeneficiarios').on('click', function () {
        if (elementoParaAlterar != null) elementoParaAlterar.style.backgroundColor = "#fff";
        $("#FormularioBeneficiario").modal('show');
    })
    $('.btnExcluirBeneficiario').off().on('click', function (e) {
        ExcluirElemento($(this).parent().parent());
    })
    $('.btnEditarBeneficiario').off().on('click', function (e) {
        let elementoAlterar = BuscarDadosAlteracaoBeneficiario($(this).parent().parent());

    })
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replaceAll('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}


function IncluirBeneficiario(nome, cpf) {
    cpf = $('.cpf').masked(cpf);
    AdicionarElementoListagem(`<tr><td class="beneficiarioCPF">${cpf}</td><td class="beneficiarioNome">${nome}</td><td><button class="btn btn-primary btnEditarBeneficiario">Alterar</button><button class="btn btn-primary btnExcluirBeneficiario">Excluir</button></td></tr>`);
}
function AdicionarElementoListagem(elemento) {
    //Cria elemento e adiciona como primeiro item da lista da tabela
    if ($('#TabelaBeneficiario tbody tr').length > 0) {
        $('#TabelaBeneficiario tbody tr').first().before(elemento);
    } else {
        $('#TabelaBeneficiario tbody').append(elemento);
    }
    //Adiciona Evento de click no novo elemento
    $('.btnExcluirBeneficiario').off().on('click', function (e) {
        ExcluirElemento($(this).parent().parent());
    })
    $('.btnEditarBeneficiario').off().on('click', function (e) {
        BuscarDadosAlteracaoBeneficiario($(this).parent().parent());
    })

}

//Lista novos Beneficiarios, indicados pela ausencia do atributo data-id na linha da tabela
function listarNovosBeneficiarios() {
    return $('#TabelaBeneficiario tbody tr').not('[data-id]');
}

function listarNovosBeneficiariosArrayObjects() {
    let elementos = listarNovosBeneficiarios();

    let retorno = [];
    if (elementos) {
        for (let item of elementos) {
            retorno.push({ Nome: item.querySelector('.beneficiarioNome').textContent, CPF: item.querySelector('.beneficiarioCPF').textContent.replaceAll('.', '').replaceAll('-', '') });
        }
        return retorno;
    }
}


function listarTodosBeneficiarios() {
    return $('#TabelaBeneficiario tbody tr');
}

function listarTodosBeneficiariosArrayObjects() {
    let elementos = listarTodosBeneficiarios();

    let retorno = [];
    if (elementos) {
        for (let item of elementos) {
            retorno.push({ Nome: item.querySelector('.beneficiarioNome').textContent, CPF: item.querySelector('.beneficiarioCPF').textContent.replaceAll('.', '').replaceAll('-', '') });
        }
        return retorno;
    }
}

function existeMesmoCPFNaLista(cpf) {
    debugger;
    if (elementoParaAlterar != null && cpf == elementoParaAlterar.querySelector('.beneficiarioCPF').textContent.replaceAll('.', '').replaceAll('-', '')) return false
    let lista = listarTodosBeneficiariosArrayObjects();
    if (lista != null && lista.length > 0) {
        let retorno = lista.find((el) => el.CPF == cpf);
        if (retorno != null && retorno != undefined) {
            return true;
        }
        return false;
    }
    return false;
}

function ExcluirElemento(el) {
    RemoverBeneficiarioTabela(el)
}
function RemoverBeneficiarioTabela(el) {
    el.remove();
}


function AlterarBeneficiario() {
    elementoParaAlterar.querySelector('.beneficiarioNome').textContent = $('#BeneficiarioNome').val();
    elementoParaAlterar.querySelector('.beneficiarioCPF').textContent = $('.cpf').masked($('#BeneficiarioCPF').val());
}
var elementoParaAlterar = null;
function BuscarDadosAlteracaoBeneficiario(el) {
    el = el[0];
    $('#BeneficiarioNome').val(el.querySelector('.beneficiarioNome').textContent);
    $('#BeneficiarioCPF').val(el.querySelector('.beneficiarioCPF').textContent);
    AlternarEvendoDeInclusaoOuAlteracao('Alterar')
    elementoParaAlterar = el;
    elementoParaAlterar.style.backgroundColor = "#c8c8fa";
}
function AlternarEvendoDeInclusaoOuAlteracao(acao) {
    $("#btn-incluir").data('acao', acao);
    $("#btn-incluir").text(acao);
}